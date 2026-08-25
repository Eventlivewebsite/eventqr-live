# KNOWN_BUGS.md

Version
Enterprise Premium Edition

Project

EventQR Live

------------------------------------------------------------

# PURPOSE

This file contains

Current Bugs

Temporary Fixes

Permanent Fixes

Future Improvements

Whenever a bug is fixed

Remove it from this file.

------------------------------------------------------------

# BUG STATUS

Critical Bugs

1

Major Bugs

2

Minor Bugs

3

------------------------------------------------------------

# BUG 001

Title

Event Creation Sometimes Fails

Status

Open

Priority

★★★★★

Module

Events

Problem

Sometimes clicking

Create Event

shows

Failed to create event.

Possible Reasons

Invalid API payload

Missing required fields

Wrong adminId

Validation failure

Temporary Fix

Check API Response

Check Console

Check Network Tab

Permanent Fix

Improve Validation

Improve Error Messages

Remove Hardcoded adminId

Use Logged In Admin ID

------------------------------------------------------------

# BUG 002

Title

Media Upload Not Started

Status

Pending

Priority

★★★★★

Module

Media

Problem

Media upload module is not implemented.

Temporary Fix

None

Permanent Fix

Implement Upload API

Image Compression

Video Upload

Thumbnail Generation

------------------------------------------------------------

# BUG 003

Title

Album CRUD Missing

Status

Pending

Priority

★★★★★

Module

Albums

Problem

Album creation and management is not completed.

Permanent Fix

Create Album API

Album Dashboard

Edit

Delete

Visibility

Sorting

------------------------------------------------------------

# BUG 004

Title

Viewer Module Not Implemented

Status

Pending

Priority

★★★★☆

Module

Viewer

Problem

Public gallery is not built.

Permanent Fix

Gallery

Albums

Photo Viewer

Video Viewer

Download

Share

------------------------------------------------------------

# BUG 005

Title

QR System Missing

Status

Pending

Priority

★★★★★

Module

QR

Problem

QR generation and analytics are not implemented.

Permanent Fix

Generate QR

Download QR

QR Analytics

Custom QR

------------------------------------------------------------

# BUG 006

Title

Analytics Module Missing

Status

Pending

Priority

★★★★☆

Module

Analytics

Problem

Dashboard analytics are not available.

Permanent Fix

Visitor Analytics

QR Analytics

Download Analytics

Storage Analytics

Country Analytics

------------------------------------------------------------

# BUG 007

Title

Billing System Missing

Status

Future

Priority

★★★☆☆

Module

Billing

Problem

Subscription and payments are not implemented.

Permanent Fix

Razorpay

Stripe

Invoices

Subscription

------------------------------------------------------------

# BUG 008

Title

Notification System Missing

Status

Future

Priority

★★★☆☆

Module

Notifications

Problem

No notification service exists.

Permanent Fix

Email

SMS

Push Notification

In-App Notification

------------------------------------------------------------

# BUG 009

Title

Activity Logs Missing

Status

Future

Priority

★★★☆☆

Module

Security

Problem

Sensitive actions are not stored.

Permanent Fix

Create Activity Log Table

Store

Login

Logout

Create

Delete

Edit

Upload

Download

------------------------------------------------------------

# TECHNICAL DEBT

Replace hardcoded values.

Improve API validation.

Improve error handling.

Create reusable service layer.

Move business logic from route handlers into services.

Add proper logging.

Add monitoring.

------------------------------------------------------------

# FUTURE IMPROVEMENTS

Redis Cache

Cloudflare R2

AWS S3

Docker

CI/CD

Background Jobs

Queue System

Image Processing

Video Processing

FFmpeg

AI Features

------------------------------------------------------------

# IMPORTANT RULES

Before starting any new feature

1.

Read PROJECT_MASTER.md

2.

Read AI_CONTEXT.md

3.

Read TODO.md

4.

Read KNOWN_BUGS.md

Never introduce duplicate bugs.

Always fix root cause.

Never hide errors.

Always write production-ready fixes.

------------------------------------------------------------

END OF KNOWN_BUGS.md