import type { RequestHandler } from "./$types";
import PushNotifications from "@pusher/push-notifications-server";
import { SECRET_KEY } from "$env/static/private";
import { PUBLIC_PUSHER_INSTANCE_ID, PUBLIC_USER_ID } from "$env/static/public";

const beamsClient = new PushNotifications({
  instanceId: PUBLIC_PUSHER_INSTANCE_ID,
  secretKey: SECRET_KEY
});

export const GET: RequestHandler = async ({ request, locals, url }) => {
  const queryUserId = url.searchParams.get("user_id");

  const user = PUBLIC_USER_ID;
  if (!user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized"
    });
  }

  if (user != queryUserId) {
    return new Response(null, {
      status: 401,
      statusText: "Inconsistent request"
    });
  } else {
    const beamsToken = beamsClient.generateToken(user);
    return new Response(JSON.stringify(beamsToken), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  return new Response();
};
