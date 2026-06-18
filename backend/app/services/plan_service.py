"""Plan persistence service — CRUD + stats for dynamic video plans."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone, date
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.plan import Plan


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_tasks(plan: Plan) -> list[dict]:
    if not plan.tasks:
        return []
    try:
        return json.loads(plan.tasks)
    except (json.JSONDecodeError, TypeError):
        return []


def _dump_tasks(tasks: list[dict]) -> str:
    return json.dumps(tasks, ensure_ascii=False)


def _get_today() -> str:
    """ISO date string for today in local-ish UTC (midnight)."""
    return datetime.now(timezone.utc).date().isoformat()


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

def create_plan(
    db: Session,
    note_id: str | None,
    title: str,
    fields: list[dict] | None = None,
    tasks: list[dict] | None = None,
    status: str = "active",
    total_days: int = 0,
    days: list[dict] | None = None,
) -> Plan:
    """Persist a new plan (called after AI extraction for plan-type videos)."""
    plan = Plan(
        id=str(uuid.uuid4()),
        note_id=note_id,
        title=title,
        schema_version=1,
        total_days=total_days,
        fields=json.dumps(fields or [], ensure_ascii=False) if fields else "[]",
        tasks=json.dumps(tasks or [], ensure_ascii=False) if tasks else "[]",
        days_json=json.dumps(days or [], ensure_ascii=False) if days else "[]",
        status=status,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

def get_plan(db: Session, plan_id: str) -> Plan | None:
    return db.query(Plan).filter(Plan.id == plan_id).first()


def get_plan_by_note(db: Session, note_id: str) -> Plan | None:
    return db.query(Plan).filter(Plan.note_id == note_id).first()


def list_plans(
    db: Session,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Plan], int]:
    per_page = min(per_page, 100)
    offset = (max(page, 1) - 1) * per_page

    total: int = db.query(func.count(Plan.id)).scalar() or 0
    plans = (
        db.query(Plan)
        .order_by(Plan.created_at.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )
    return plans, total


# ---------------------------------------------------------------------------
# Stats (badge)
# ---------------------------------------------------------------------------

def get_plan_stats(db: Session) -> dict[str, int]:
    """Return {open_tasks, due_today} for the BottomTabBar badge."""
    plans = db.query(Plan).filter(Plan.status != "done").all()

    open_tasks = 0
    due_today = 0
    today_str = _get_today()

    for plan in plans:
        tasks = _parse_tasks(plan)
        for t in tasks:
            if not t.get("done", False):
                open_tasks += 1
                # scheduled_at is ISO datetime string; check if date portion matches today
                sched = t.get("scheduled_at")
                if sched:
                    try:
                        task_date = sched[:10]  # YYYY-MM-DD
                        if task_date == today_str:
                            due_today += 1
                    except Exception:
                        pass

    return {"open_tasks": open_tasks, "due_today": due_today}


# ---------------------------------------------------------------------------
# Task mutations
# ---------------------------------------------------------------------------

def toggle_task(db: Session, plan_id: str, task_id: str) -> Plan | None:
    plan = get_plan(db, plan_id)
    if plan is None:
        return None

    tasks = _parse_tasks(plan)
    toggled = False
    for t in tasks:
        if t.get("id") == task_id:
            t["done"] = not t.get("done", False)
            toggled = True
            break

    if not toggled:
        return None  # task not found

    plan.tasks = _dump_tasks(tasks)
    plan.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(plan)
    return plan


def add_task(
    db: Session,
    plan_id: str,
    title: str,
    scheduled_at: str | None = None,
    reminder_at: str | None = None,
) -> Plan | None:
    plan = get_plan(db, plan_id)
    if plan is None:
        return None

    tasks = _parse_tasks(plan)
    new_task: dict[str, Any] = {
        "id": f"t-{uuid.uuid4().hex[:8]}",
        "title": title,
        "done": False,
    }
    if scheduled_at:
        new_task["scheduled_at"] = scheduled_at
    if reminder_at:
        new_task["reminder_at"] = reminder_at

    tasks.append(new_task)
    plan.tasks = _dump_tasks(tasks)
    plan.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(plan)
    return plan


def delete_task(db: Session, plan_id: str, task_id: str) -> Plan | None:
    plan = get_plan(db, plan_id)
    if plan is None:
        return None

    tasks = _parse_tasks(plan)
    new_tasks = [t for t in tasks if t.get("id") != task_id]
    if len(new_tasks) == len(tasks):
        return None  # nothing deleted

    plan.tasks = _dump_tasks(new_tasks)
    plan.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(plan)
    return plan


def delete_plan(db: Session, plan_id: str) -> bool:
    """Delete a plan by ID. Returns True if deleted, False if not found."""
    plan = get_plan(db, plan_id)
    if plan is None:
        return False
    db.delete(plan)
    db.commit()
    return True
