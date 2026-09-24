# Warnings Power Rules Bot

Discord rules and moderation bot with department rules, warning points, escalation, moderation logs, timeouts, mutes, jail actions, bans, and automatic temporary-ban expiry.

## Railway deployment

1. Deploy this repository from GitHub.
2. Attach a Railway **Volume** to the service with mount path `/data`.
3. Add these Railway Variables:
   - `DISCORD_TOKEN`: the bot token.
   - `CLIENT_ID`: the Discord application/client ID.
   - `GUILD_ID`: the target server ID. This makes slash-command updates immediate.
   - `MOD_LOG_CHANNEL_ID`: channel ID for moderation logs.
   - `MUTED_ROLE_ID`: role ID used by `/mute` and `/unmute`.
   - `JAILED_ROLE_ID`: role ID used by `/jail` and `/unjail`.
   - `JAIL_CHANNEL_ID`: the only text channel jailed members can see and speak in.
   - `DATA_FILE=/data/moderation.json`: stores warning points and history on the Volume.
4. In Railway, open the service shell or run the deploy command locally once:

   ```bash
   npm install
   npm run deploy
   ```

   The deploy command registers all slash commands for `GUILD_ID`.
5. Railway starts the bot with `npm start`.

The Discord bot must be invited with the `bot` and `applications.commands` scopes. Give it the permissions needed for the moderation actions you use, including View Channels, Send Messages, Moderate Members, Ban Members, Manage Roles, and Read Message History. The bot's role must be above the muted and jailed roles.

## Commands

Moderation: `/warn`, `/warnings`, `/clearwarnings`, `/timeout`, `/mute`, `/unmute`, `/jail`, `/unjail`, `/ban`, `/unban`, and `/hackban`.

**Rules are not handled by Sloth.** General, Security, Research, Technical, and Janitor rules are handled by the separate **Wraith / General-Rules** bot.

Jailing removes assignable roles, saves them in `DATA_FILE`, applies member-specific restrictions to text channels, and restores the saved roles when `/unjail` is used. The bot needs Manage Roles and Manage Channels, and its role must be above the jailed role and the roles it needs to remove.

All moderation slash commands are visible in the command list. Moderation commands still require the appropriate permission when used; visibility does not grant access.

## Persistence variable

In Railway, open the `Warnings-Power-` service, select **Variables**, click **New Variable**, and add:

```text
DATA_FILE=/data/moderation.json
```

This variable tells the bot to store warning history and saved jail roles on the Railway Volume. The Volume must be attached to the service with mount path `/data`. Do not put this in Discord or in a source-code file; it belongs in Railway Variables.