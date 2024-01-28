<script lang="ts">
  import { onMount } from "svelte";
  import { PUBLIC_PUSHER_INSTANCE_ID, PUBLIC_USER_ID } from "$env/static/public";
  import * as PusherPushNotifications from "@pusher/push-notifications-web";

  onMount(async () => {
    if (Notification.permission === "denied") return;
    if (!("serviceWorker" in window.navigator)) return;
    window.navigator.serviceWorker.ready.then(async (serviceWorkerRegistration) => {
      console.log(serviceWorkerRegistration);
      const beamsClient = new PusherPushNotifications.Client({
        instanceId: PUBLIC_PUSHER_INSTANCE_ID,
        serviceWorkerRegistration: serviceWorkerRegistration
      });

      if (PUBLIC_USER_ID) {
        const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
          url: "/api/pusher/beams-auth"
        });

        const registrationState = await beamsClient.getRegistrationState().then(async (state) => {
          switch (state) {
            case "PERMISSION_PROMPT_REQUIRED":
              console.log("Permissions required");
              await requestNotificationPermission();
              await beamsClient.stop();
              return "PERMISSION_PROMPT_REQUIRED";
            case "PERMISSION_DENIED":
              console.log("Permissions denied");
              await beamsClient.stop();
              return "PERMISSION_DENIED";
            default:
              console.log("Permissions granted");
              return "PERMISSION_GRANTED";
          }
        });

        if (registrationState === "PERMISSION_PROMPT_REQUIRED" || registrationState === "PERMISSION_DENIED") return;

        await beamsClient
          .start()
          .then(() => beamsClient.setUserId(PUBLIC_USER_ID, beamsTokenProvider))
          .then(() => console.log("Successfully registered and subscribed!"))
          .catch(console.error);

        await beamsClient
          .getUserId()
          .then((userId) => {
            if (userId !== PUBLIC_USER_ID) {
              console.log("Not logged in");
              return beamsClient.stop();
            }
          })
          .catch(console.error);
      } else {
        console.log("Not logged in");
        await beamsClient.stop().catch(console.error);
      }
    });
  });

  async function requestNotificationPermission() {
    if (window.Notification.permission === "granted") return;
    const permission = await window.Notification.requestPermission();
    if (permission === "granted") {
      window.location.reload();
    } else {
      console.log("Permission denied");
    }
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
