# NEXUS Universal Action Protocol v1

## Purpose

NEXUS actions should have one canonical identity even when they are opened from
different channels or devices.

The protocol separates:

1. the business action;
2. the opaque action token;
3. the channel-specific launch link; and
4. the channel adapter that performs communication.

This prevents Telegram, WhatsApp, Outlook, or any future channel from becoming
the owner of NEXUS business logic.

## Canonical action

A NEXUS action reference contains only:

- protocol version;
- resource type;
- opaque token; and
- requested action verb.

Example:

```text
nexus://task/t_QF9w2nZKp83m?action=review
```

The opaque token must resolve server-side. It must not contain customer names,
account numbers, facility amounts, document titles, identity numbers, or other
business data.

## Web routing

A browser link should expose only the opaque token:

```text
https://nexus.example/a/t_QF9w2nZKp83m
```

The server resolves the token and then applies authentication, authorisation,
workspace membership, resource state, and expiry checks.

## Telegram routing

A Telegram Mini App launch link can carry the same opaque token:

```text
https://t.me/<bot>?startapp=t_QF9w2nZKp83m&mode=fullscreen
```

or, for a named Mini App:

```text
https://t.me/<bot>/<app>?startapp=t_QF9w2nZKp83m&mode=fullscreen
```

The `startapp` value is a locator only. It is not authorisation.

Telegram Mini App `initData` must be validated by a trusted backend before
Telegram identity is accepted. `initDataUnsafe` must not be used as trusted
authentication input.

Official references:

- https://core.telegram.org/bots/webapps
- https://core.telegram.org/api/links
- https://core.telegram.org/bots/api

## Required server-side gate

Every action resolution should follow this order:

```text
opaque token
    |
token lookup
    |
expiry / revocation
    |
authenticated identity
    |
NEXUS identity mapping
    |
RBAC / workspace membership
    |
resource-level permission
    |
current workflow state
    |
action allowed
```

A valid link alone never grants access.

## Communication boundary

Communication is represented as a `CommunicationIntent`.

Adapters implement the channel-specific operation:

```text
CommunicationIntent
        |
   policy check
        |
   human approval
        |
  channel adapter
   /     |      \
WA   Outlook  Telegram
```

The v1 implementation deliberately has no auto-send implementation and stores no
provider credentials.

## Logging

Logs should contain:

- action event ID;
- actor reference;
- workspace reference;
- resource type;
- outcome;
- policy decision; and
- timestamp.

Full action tokens, customer data, document content, provider credentials, and
message secrets should not be written to ordinary application logs.

## Design rules

- One customer remains one NEXUS workspace.
- Channel links never become system-of-record identifiers.
- Tokens are opaque, high-entropy, revocable, and preferably short-lived.
- Human approval is the default before external communication.
- Confidential information is governed by channel policy, not by UI choice.
- No customer data or production credentials belong in this public repository.
