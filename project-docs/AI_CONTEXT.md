# AI_CONTEXT.md

Version
Enterprise Premium Edition

Purpose

This file is the permanent brain of the EventQR Live project.

Whenever this project is opened in a new ChatGPT session, this file should be read FIRST before writing even a single line of code.

This document defines architecture, philosophy, coding rules, business rules and long-term vision.

Nothing inside this document should be ignored.

------------------------------------------------------------

# PROJECT NAME

EventQR Live

------------------------------------------------------------

# PROJECT VISION

This is NOT just another gallery project.

The goal is to build the world's most premium Event Gallery Platform.

Everything should feel premium.

Everything should be scalable.

Everything should be production ready.

Everything should follow enterprise architecture.

The UI should compete with Apple.

The Dashboard should compete with Stripe.

The Gallery should compete with Pixieset.

The Animations should feel like Framer.

------------------------------------------------------------

# PRIMARY GOAL

Build a platform where

Photography Studios

Wedding Companies

Event Organizers

can manage

Clients

Events

Albums

Photos

Videos

QR

Analytics

Billing

from one premium dashboard.

------------------------------------------------------------

# LONG TERM TARGET

Become the best Event Gallery SaaS Platform.

Compete against

Pixieset

Pic-Time

SmugMug

Google Photos

Apple Photos

------------------------------------------------------------

# IMPORTANT RULE

This project should NEVER become a normal CRUD application.

Every feature must feel premium.

Every screen must feel expensive.

Every interaction must feel smooth.

------------------------------------------------------------

# PROJECT PHILOSOPHY

Premium First

Security First

Performance First

Scalability First

Code Quality First

User Experience First

------------------------------------------------------------

# DEVELOPMENT PHILOSOPHY

Never write quick fixes.

Never write temporary code.

Never write duplicate code.

Always think long term.

Always think enterprise.

Always build reusable components.

------------------------------------------------------------

# ARCHITECTURE

Enterprise

Modular

Reusable

Maintainable

Scalable

Multi Tenant

Cloud Ready

AI Ready

------------------------------------------------------------

# PROJECT TYPE

Enterprise SaaS

Multi Tenant

Cloud Native

Production Ready

------------------------------------------------------------

# CURRENT STATUS

Authentication

Completed

Client CRUD

Completed

Client Dashboard

Base Ready

Event CRUD

In Progress

Albums

Pending

Media Upload

Pending

Viewer

Pending

QR

Pending

Analytics

Pending

Billing

Future

AI

Future

------------------------------------------------------------

END OF PART 1
------------------------------------------------------------

# DEVELOPMENT RULES

Every line of code should follow enterprise standards.

Never write code just to make it work.

Write code that will still be maintainable after 5 years.

Always think

Performance

Scalability

Security

Maintainability

------------------------------------------------------------

# CODING PHILOSOPHY

Simple

Readable

Reusable

Scalable

Future Proof

Production Ready

------------------------------------------------------------

# NEVER DO THESE THINGS

Never duplicate code

Never hardcode IDs

Never hardcode URLs

Never write business logic inside components

Never trust frontend data

Never skip validation

Never skip authentication

Never skip authorization

Never use any

Never ignore TypeScript errors

Never expose secrets

Never expose database structure

Never expose password hashes

------------------------------------------------------------

# ALWAYS DO THESE THINGS

Use TypeScript

Use Prisma ORM

Use reusable components

Use proper naming

Write clean code

Validate every request

Handle every error

Return proper response

Keep components small

Split large logic

------------------------------------------------------------

# FOLDER RULES

Every feature should have its own folder.

Bad

components/

100 files

Good

components/

clients/

events/

albums/

gallery/

viewer/

dashboard/

auth/

settings/

analytics/

------------------------------------------------------------

# COMPONENT RULES

Every component should have only one responsibility.

Example

GalleryCard

Only renders card

GalleryGrid

Only renders grid

GalleryModal

Only renders modal

GalleryHeader

Only renders header

Never combine everything into one file.

------------------------------------------------------------

# FILE SIZE RULE

Ideal

Below 300 lines

Acceptable

500 lines

Maximum

700 lines

If bigger

Split immediately.

------------------------------------------------------------

# BUSINESS LOGIC RULE

Business logic

Never inside React Component.

Business logic

Should stay inside

API

Service

Helper

Utility

------------------------------------------------------------

# API RULES

Every API

Should

Authenticate User

Validate Role

Validate Ownership

Validate Data

Handle Errors

Return JSON

Never return HTML.

------------------------------------------------------------

# DATABASE RULES

Always use Prisma.

Never use raw SQL

Unless absolutely required.

Always create relations.

Always use indexes.

Always validate ownership before queries.

------------------------------------------------------------

# NEXT.JS RULES

Use App Router only.

Use Server Components whenever possible.

Use Client Components only when required.

Avoid unnecessary useEffect.

Use Server Actions in future if beneficial.

------------------------------------------------------------

# REACT RULES

Functional Components only.

Hooks only.

No class components.

Reusable state.

Avoid prop drilling.

Create custom hooks where needed.

------------------------------------------------------------

# TYPESCRIPT RULES

Strict Mode

Enabled

No any

Use Interfaces

Use Types

Use Enums

Never ignore TS errors.

------------------------------------------------------------

# NAMING CONVENTION

Components

PascalCase

ClientCard.tsx

GalleryGrid.tsx

EventModal.tsx

--------------------------------

Functions

camelCase

createEvent()

deleteAlbum()

uploadMedia()

--------------------------------

Variables

camelCase

--------------------------------

Constants

UPPER_CASE

--------------------------------

Folders

lowercase

--------------------------------

Routes

REST style

/api/events

/api/albums

/api/media

------------------------------------------------------------

# IMPORT RULES

Always use

Absolute Imports

Example

@/components

@/lib

@/utils

Never use

../../../../

style imports.

------------------------------------------------------------

# ERROR HANDLING

Every API

must have

try

catch

Proper status codes

Proper messages

No internal error leaks.

------------------------------------------------------------

END OF PART 2
------------------------------------------------------------

# ENTERPRISE SECURITY RULES

Security Level

Enterprise Grade

Zero Trust Architecture

Every Request Must Be Verified

Nothing Should Be Trusted Automatically.

------------------------------------------------------------

# AUTHENTICATION RULES

Every Protected API

↓

Verify JWT

↓

Verify User Exists

↓

Verify Account Active

↓

Verify Role

↓

Verify Ownership

↓

Execute Request

------------------------------------------------------------

# JWT RULES

JWT Should

Contain

User ID

Role

Client ID (if applicable)

Issued Time

Expiry Time

Never Store Sensitive Data Inside JWT.

Never Store Password.

Never Store Email Verification Token.

------------------------------------------------------------

# COOKIE RULES

HTTP Only

Enabled

Secure

Enabled (Production)

SameSite

Strict

JavaScript

Must Never Read Authentication Cookies.

------------------------------------------------------------

# PASSWORD RULES

Never Store Plain Password

Always Hash Using bcrypt

Minimum Salt Rounds

12

Future

Argon2 Upgrade

Password Reset

Must Generate Secure Token

Never Send Password In Email

------------------------------------------------------------

# AUTHORIZATION RULES

Authentication

Answers

Who Are You?

Authorization

Answers

What Can You Do?

Never Mix These Two Concepts.

------------------------------------------------------------

# ROLE SYSTEM

Current

SUPER_ADMIN

CLIENT

Future

MANAGER

EDITOR

PHOTOGRAPHER

UPLOADER

VIEWER_MANAGER

Each Role Should Have Independent Permissions.

------------------------------------------------------------

# MULTI TENANT RULES

Each Client

Own Database Records

Own Events

Own Albums

Own Media

Own Analytics

Own Storage

No Client Can Access Another Client's Data.

------------------------------------------------------------

# OWNERSHIP VALIDATION

Every Query Must Check

Owner

Client

Admin

Before Returning Data.

Example

Wrong

Find Event By ID

Correct

Find Event By ID

AND

Client ID

------------------------------------------------------------

# CLIENT ISOLATION

Client A

Cannot

Read

Write

Update

Delete

Any Data

Belonging To

Client B.

This Rule Can Never Be Broken.

------------------------------------------------------------

# API SECURITY

Every API Must

Authenticate

Authorize

Validate Input

Validate Ownership

Log Sensitive Actions

Return Safe Errors

Never Return Internal Stack Trace.

------------------------------------------------------------

# DATABASE SECURITY

Use Prisma ORM

Never Trust Raw Input

Never Concatenate SQL

Use Relations

Use Transactions

Index Frequently Used Fields

Validate Foreign Keys

------------------------------------------------------------

# FILE UPLOAD SECURITY

Allow Only

Valid MIME Types

Validate Extension

Validate File Size

Validate Ownership

Store Metadata In Database

Store Files Outside Database

Future

Virus Scan

Malware Scan

AI NSFW Detection

------------------------------------------------------------

# DOWNLOAD SECURITY

Download Allowed

Only If

User Has Permission

Future

Signed URLs

Temporary Download Links

Watermarked Downloads

Download Expiry

------------------------------------------------------------

# QR SECURITY

QR Tokens

Should Be Unique

Future

Encrypted QR

Expiry Date

Password Protected QR

One Time QR

Private QR

------------------------------------------------------------

# AUDIT LOGGING

Log Everything Important

Login

Logout

Password Change

Client Create

Client Delete

Event Delete

Album Delete

Upload

Download

Payment

Subscription

Permission Change

------------------------------------------------------------

# ERROR HANDLING

Never Return

Database Errors

Never Return

Stack Trace

Never Return

Internal Paths

Always Return

Safe JSON

------------------------------------------------------------

# RATE LIMITING

Future

Login

5 Requests

Password Reset

3 Requests

OTP

5 Requests

Upload

Limited

API

Rate Limited

------------------------------------------------------------

# FUTURE SECURITY

Two Factor Authentication

Trusted Devices

Session Management

Login History

IP Monitoring

Geo Location Alerts

Device Fingerprinting

AI Fraud Detection

------------------------------------------------------------

# NON NEGOTIABLE SECURITY RULES

✓ Never trust frontend

✓ Never expose secrets

✓ Never expose passwords

✓ Never expose JWT secret

✓ Never skip ownership validation

✓ Never skip authentication

✓ Never skip authorization

✓ Never skip input validation

✓ Every delete should be logged

✓ Every payment should be logged

✓ Every upload should be validated

✓ Every download should be permission checked

------------------------------------------------------------

END OF PART 3
------------------------------------------------------------

# BUSINESS PHILOSOPHY

This project is NOT a college project.

This is NOT a demo project.

This is NOT a template.

This is a real Enterprise SaaS Product.

Every future decision should be taken assuming this project will serve millions of users.

------------------------------------------------------------

# PRODUCT PHILOSOPHY

Whenever adding a feature ask:

Is it Premium?

Is it Scalable?

Is it Secure?

Is it Beautiful?

Is it Fast?

If the answer is NO

Do not implement it.

------------------------------------------------------------

# PREMIUM UI PHILOSOPHY

Every page should feel expensive.

Every animation should feel smooth.

Every card should have depth.

Every hover should feel natural.

Every click should feel satisfying.

Never use ugly UI.

Never use default browser styling.

Never build boring dashboards.

------------------------------------------------------------

# DESIGN LANGUAGE

Dark Theme First

Glassmorphism

Soft Shadows

Large Rounded Corners

Luxury Typography

Premium Gradients

Minimal Design

Micro Interactions

Modern Dashboard

Smooth Motion

------------------------------------------------------------

# ANIMATION RULES

Animations should improve UX.

Never distract users.

Use

Fade

Scale

Slide

Blur

Spring

Hover

Loading Skeletons

Smooth Page Transition

Never over animate.

------------------------------------------------------------

# PERFORMANCE PHILOSOPHY

Fast First Paint

Lazy Loading

Image Optimization

Code Splitting

Reusable Components

Server Components whenever possible

Avoid unnecessary re-renders

Every page should feel instant.

------------------------------------------------------------

# BUSINESS RULES

One Client

↓

Unlimited Events

One Event

↓

Unlimited Albums

One Album

↓

Unlimited Photos

Unlimited Videos

Every Event

Has Unique Slug

Every Album

Has Unique Slug

Storage depends on subscription.

Every important action is logged.

------------------------------------------------------------

# AI FEATURES (FUTURE)

AI Face Recognition

AI Guest Recognition

AI Smart Albums

AI Duplicate Detection

AI Best Photo Selection

AI Blur Detection

AI Smile Detection

AI Search

AI Auto Caption

AI Highlight Video

AI Timeline Generator

AI Story Generator

AI Memory Book

------------------------------------------------------------

# WHITE LABEL (FUTURE)

Custom Domain

Custom Logo

Custom Branding

Custom Colors

Custom Email

Own Login Page

Own Mobile App

Agency Branding

------------------------------------------------------------

# ENTERPRISE FEATURES (FUTURE)

Multi Branch Support

Team Members

Role Management

Approval Workflow

Task Assignment

Live Upload

Cloud Storage

CDN

Multi Region Deployment

Disaster Recovery

------------------------------------------------------------

# TAHELKA MACHANE WALA VISION

The final product should be capable of competing with:

Pixieset

Pic-Time

SmugMug

Google Photos

Apple Photos

It should become India's most premium Event Gallery SaaS.

People should say:

"This doesn't look like an Indian startup.

It looks like an Apple product."

------------------------------------------------------------

# NEVER CHANGE THESE DECISIONS

Never downgrade UI quality.

Never remove enterprise architecture.

Never replace Prisma.

Never compromise security.

Never hardcode sensitive values.

Never write duplicate code.

Never write temporary fixes without proper TODO.

Never sacrifice scalability for speed of development.

------------------------------------------------------------

# HOW FUTURE CHATGPT SHOULD WORK

Before writing code:

1. Read PROJECT_MASTER.md

2. Read AI_CONTEXT.md

3. Read TODO.md

4. Read KNOWN_BUGS.md

5. Understand existing architecture.

6. Continue from current progress.

7. Never rewrite working modules unnecessarily.

8. Follow existing coding style.

9. Build reusable components.

10. Maintain premium quality everywhere.

------------------------------------------------------------

# FINAL GOAL

Build the world's most premium

Wedding

Photography

Event Gallery

Management Platform

with

Enterprise Security

Apple Level UI

Google Level Performance

Stripe Level Dashboard

Pixieset Level Gallery

AI Powered Features

Unlimited Scalability

Production Ready Architecture

------------------------------------------------------------

END OF AI_CONTEXT.md