CREATE TABLE
    IF NOT EXISTS tickets (
        code UUID PRIMARY KEY,
        order_id TEXT NOT NULL,
        seat_index INT NOT NULL CHECK (seat_index BETWEEN 1 AND 6),
        user_id BIGINT NOT NULL,
        event_id BIGINT NOT NULL,
        event_name TEXT NOT NULL,
        sector_name TEXT NOT NULL,
        pdf_path TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        UNIQUE (order_id, seat_index)
    );

CREATE INDEX IF NOT EXISTS tickets_order_idx ON tickets (order_id);

CREATE INDEX IF NOT EXISTS tickets_user_idx ON tickets (user_id);