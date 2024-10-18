// *FROM CHATGPT*

import { sql } from "drizzle-orm";
import { drizzlePool } from "../../db/conn.js";

// create trigger function
async function createTriggerFunction() {
  await drizzlePool.execute(
    sql`CREATE OR REPLACE FUNCTION notify_session_change() 
              RETURNS trigger AS $$
              BEGIN
                PERFORM pg_notify('session_change', 'session_change');
                RETURN NEW;
              END;
              $$ LANGUAGE plpgsql;`
  ); // session_change is the Channel
  await drizzlePool.execute(
    sql`CREATE OR REPLACE FUNCTION notify_pending_membership() 
              RETURNS trigger AS $$
              BEGIN
                PERFORM pg_notify('pending_membership', 'pending_membership');
                RETURN NEW;
              END;
              $$ LANGUAGE plpgsql;`
  ); // pending_membership is the Channel
  await drizzlePool.execute(
    sql`CREATE OR REPLACE FUNCTION notify_feelings_change() 
          RETURNS trigger AS $$
            BEGIN
                IF (TG_OP = 'INSERT') THEN
                  PERFORM pg_notify('feelings_change', json_build_object('operation', TG_OP, 'data', row_to_json(NEW))::text);
                ELSIF (TG_OP = 'UPDATE') THEN
                  PERFORM pg_notify('feelings_change', json_build_object('operation', TG_OP, 'data', row_to_json(NEW))::text);
                ELSIF (TG_OP = 'DELETE') THEN
                  PERFORM pg_notify('feelings_change', json_build_object('operation', TG_OP, 'data', row_to_json(OLD))::text);
                END IF;
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;`
  ); // feelings_change is the Channel
}

// create trigger
async function createTrigger() {
  // trigger for sessions_change
  await drizzlePool.execute(
    sql`
                CREATE OR REPLACE TRIGGER session_change_trigger
                AFTER INSERT OR DELETE ON "pixelianSessions"
                FOR EACH ROW
                EXECUTE FUNCTION notify_session_change();
              `
  );
  // trigger for incoming Membership proof
  await drizzlePool.execute(
    sql`
                CREATE OR REPLACE TRIGGER pending_membership_trigger
                AFTER INSERT OR DELETE ON "pixelian_membership_proof"
                FOR EACH ROW
                EXECUTE FUNCTION notify_pending_membership();
              `
  );
  // trigger for feelings_change
  await drizzlePool.execute(
    sql`
                CREATE OR REPLACE TRIGGER feelings_change_trigger
                AFTER INSERT OR UPDATE OR DELETE ON "pixelian_feelings"
                FOR EACH ROW
                EXECUTE FUNCTION notify_feelings_change();
              `
  );
}

// setup
async function setUpSessionsNotification() {
  try {
    await createTriggerFunction();
  } catch (error) {
    console.log(error);
    return;
  }
  try {
    await createTrigger();
  } catch (error) {
    console.log(error);
    return;
  }

  console.log("Successfully created Trigger");
}

setUpSessionsNotification();
