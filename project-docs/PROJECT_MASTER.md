# IMPORTANT FOR ANY AI

If you are a new ChatGPT session:

1. Read PROJECT_MASTER.md completely.
2. Read AI_CONTEXT.md completely.
3. Read TODO.md.
4. Read KNOWN_BUGS.md.
5. Analyze the uploaded project ZIP.
6. Continue from the current project state.
7. Never rewrite completed modules.
8. Always follow the existing architecture.
9. Always maintain Enterprise-grade code quality.
10. Always maintain Premium UI/UX.

# EVENTQR LIVE
# PROJECT MASTER DOCUMENT

Version
Enterprise Premium Edition V1.0

Author
OpenAI + Project Owner

Status
Production Architecture

------------------------------------------------------------

# PROJECT OVERVIEW

Project Name

EventQR Live

------------------------------------------------------------

# PROJECT DESCRIPTION

EventQR Live is an Enterprise Grade Wedding & Event Gallery Platform.

The system allows photography studios, wedding companies and event organizers
to create premium online galleries where guests can scan a QR code and instantly
view photos, videos, albums and memories.

This is NOT just another gallery website.

The target is to build one of the world's most premium event gallery platforms.

------------------------------------------------------------

# PROJECT GOAL

Build a Premium

Fast

Secure

Scalable

Enterprise

Multi-Tenant

AI Powered

Event Management Platform.

------------------------------------------------------------

# TARGET USERS

Super Admin

↓

Photography Studios

↓

Wedding Companies

↓

Clients

↓

Bride & Groom

↓

Guests

------------------------------------------------------------

# PROJECT PHILOSOPHY

Every screen should feel premium.

Every animation should feel smooth.

Every API should be secure.

Every database query should be optimized.

Every feature should be scalable.

Never compromise on quality.

------------------------------------------------------------

# LONG TERM VISION

Become the best Event Gallery Platform in the world.

Compete with

Pixieset

Pic-Time

SmugMug

Google Photos

Apple Photos

------------------------------------------------------------

# CORE MODULES

Authentication

Admin Dashboard

Client Dashboard

Event Management

Album Management

Media Management

QR System

Gallery Viewer

Guest Book

Analytics

Storage Management

Subscription

Billing

Notification

AI Features

------------------------------------------------------------

# PROJECT TYPE

Enterprise SaaS

Multi Tenant

Cloud Ready

Mobile First

Production Ready

------------------------------------------------------------

# DESIGN GOALS

Apple Level UI

Google Level Performance

Instagram Level Gallery

Netflix Level Animations

Stripe Level Dashboard

------------------------------------------------------------

# TECH STACK

Frontend

Next.js

React

TypeScript

TailwindCSS

Backend

Next.js Route Handlers

Prisma ORM

PostgreSQL

Authentication

JWT

bcrypt

HTTP Only Cookies

Validation

Zod

Database

PostgreSQL

ORM

Prisma

Future

Redis

ElasticSearch

Cloudflare R2

AWS S3

------------------------------------------------------------

# PROJECT STRUCTURE

apps/

admin/

viewer/

docs/

packages/

ui/

typescript-config/

eslint-config/

------------------------------------------------------------

# ADMIN APPLICATION

Purpose

System Administration

Contains

Dashboard

Clients

Events

Analytics

Settings

Billing

Future

------------------------------------------------------------

# VIEWER APPLICATION

Purpose

Public Gallery

Contains

Gallery

Albums

Photos

Videos

Guest Book

QR

Downloads

------------------------------------------------------------

# DATABASE

PostgreSQL

Prisma ORM

Relational

Indexed

Optimized

------------------------------------------------------------

# CURRENT PROJECT STATUS

Authentication

Completed

Client CRUD

Completed

Client Dashboard

Base Ready

Event Creation

Started

Albums

Pending

Media Upload

Pending

QR System

Pending

Analytics

Pending

AI

Future

------------------------------------------------------------

END OF PART 1
------------------------------------------------------------

# COMPLETE PROJECT ARCHITECTURE

Architecture

Enterprise

Modular

Scalable

Maintainable

Reusable

Future Proof

------------------------------------------------------------

# HIGH LEVEL ARCHITECTURE

                    Super Admin

                          │

                Authentication Layer

                          │

                 Authorization Layer

                          │

              Admin Dashboard (NextJS)

                          │

             PostgreSQL + Prisma ORM

                          │

        ┌─────────────────────────────────┐
        │                                 │
        ▼                                 ▼

   Client Dashboard                 Viewer Website

        │                                 │

        ▼                                 ▼

     Event System                  Public Gallery

        │                                 │

        ▼                                 ▼

     Album System                   Guest Experience

        │                                 │

        ▼                                 ▼

     Media System                   QR System

        │                                 │

        ▼                                 ▼

     Analytics                     Downloads

------------------------------------------------------------

# PROJECT FOLDER STRUCTURE

apps/

│

├── admin/

│   │
│   ├── src/
│   │
│   ├── app/
│   │
│   ├── components/
│   │
│   ├── lib/
│   │
│   ├── hooks/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   └── styles/

│

├── viewer/

│   │
│   ├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── utils/
│   └── styles/

│

├── docs/

│

packages/

│

├── ui/

├── eslint-config/

└── typescript-config/

------------------------------------------------------------

# ADMIN STRUCTURE

Dashboard

Clients

Events

Albums

Media

Analytics

Billing

Notifications

Settings

Profile

------------------------------------------------------------

# CLIENT DASHBOARD STRUCTURE

Dashboard

Events

Albums

Uploads

Gallery

Analytics

Storage

Subscription

Settings

------------------------------------------------------------

# VIEWER STRUCTURE

Landing

Gallery

Albums

Photos

Videos

Guest Book

Downloads

About

------------------------------------------------------------

# COMPONENT ARCHITECTURE

Every Component

Should Have

Single Responsibility

Reusable

Small

Independent

------------------------------------------------------------

# REUSABLE COMPONENTS

Button

Input

Modal

Drawer

Card

Table

Badge

Avatar

Dropdown

Toast

Loader

Skeleton

Pagination

SearchBar

------------------------------------------------------------

# PAGE STRUCTURE

Each Page

Should Have

Header

Content

Footer

Loading

Error State

Empty State

------------------------------------------------------------

# MODULE SEPARATION

Authentication

↓

Independent

Client

↓

Independent

Events

↓

Independent

Albums

↓

Independent

Media

↓

Independent

QR

↓

Independent

Analytics

↓

Independent

------------------------------------------------------------

# LIB FOLDER

Contains

Prisma

Auth

JWT

Helpers

Constants

Permissions

------------------------------------------------------------

# UTILS FOLDER

Formatting

Date

Currency

Slug

Storage

Validation

Encryption

------------------------------------------------------------

# TYPES FOLDER

Interfaces

Enums

API Types

Database Types

------------------------------------------------------------

# HOOKS

Custom React Hooks

Should Never

Contain Business Logic

Only UI Logic

------------------------------------------------------------

# BUSINESS LOGIC

Business Logic

Always

Inside

API

OR

Service Layer

Never

Inside Component

------------------------------------------------------------

# API STRUCTURE

Every Feature

Own Route

Example

/api/admin

/api/client

/api/event

/api/album

/api/media

/api/auth

/api/upload

/api/analytics

------------------------------------------------------------

# FILE NAMING

Components

PascalCase

Example

ClientCard.tsx

AlbumGrid.tsx

MediaViewer.tsx

------------------------------------------------------------

# API FILES

route.ts

Only

------------------------------------------------------------

# UTIL FILES

camelCase

Example

generateSlug.ts

hashPassword.ts

formatDate.ts

------------------------------------------------------------

# IMPORT RULES

Absolute Imports

Only

Example

@/components

@/lib

@/utils

------------------------------------------------------------

# CURRENT ARCHITECTURE STATUS

Authentication

✔

Client CRUD

✔

Dashboard

✔

Events

🚧

Albums

⬜

Media

⬜

QR

⬜

Analytics

⬜

------------------------------------------------------------

END OF PART 2
------------------------------------------------------------

# AUTHENTICATION & AUTHORIZATION

Architecture

Enterprise Grade

JWT + HTTP Only Cookies

Role Based Access Control (RBAC)

Ownership Validation

Permission Validation

Audit Logging

------------------------------------------------------------

# AUTHENTICATION FLOW

User

↓

Login

↓

Validate Credentials

↓

bcrypt Compare

↓

Generate JWT

↓

Store HTTP Only Cookie

↓

Authenticated

↓

Access Dashboard

------------------------------------------------------------

# LOGIN TYPES

SUPER_ADMIN Login

Client Login

Future

Manager Login

Photographer Login

Editor Login

Viewer Manager Login

------------------------------------------------------------

# CURRENT ROLES

SUPER_ADMIN

Highest Permission

Can Access Everything

--------------------------------------------

CLIENT

Own Dashboard

Own Events

Own Albums

Own Media

Own Analytics

Cannot Access Other Clients

--------------------------------------------

# FUTURE ROLES

MANAGER

Manage Events

Manage Albums

Manage Team

Cannot Access Billing

--------------------------------------------

EDITOR

Edit Albums

Edit Photos

Edit Videos

No Billing

--------------------------------------------

PHOTOGRAPHER

Upload Photos

Upload Videos

Create Albums

Cannot Delete Client

--------------------------------------------

UPLOADER

Only Upload

No Delete

No Billing

--------------------------------------------

VIEWER_MANAGER

Manage Guest Book

Manage QR

Manage Gallery

------------------------------------------------------------

# AUTHORIZATION

Every Request

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

# OWNERSHIP VALIDATION

SUPER_ADMIN

↓

Everything

CLIENT

↓

Own Data Only

Manager

↓

Assigned Data Only

Photographer

↓

Assigned Event Only

------------------------------------------------------------

# ACCESS MATRIX

SUPER_ADMIN

Clients

✔

Events

✔

Albums

✔

Media

✔

Billing

✔

Analytics

✔

Settings

✔

--------------------------------------------

CLIENT

Own Events

✔

Own Albums

✔

Own Media

✔

Own Analytics

✔

Own Settings

✔

Other Clients

❌

--------------------------------------------

PHOTOGRAPHER

Upload

✔

View

✔

Delete Client

❌

Billing

❌

------------------------------------------------------------

# PASSWORD POLICY

Minimum

8 Characters

Future

12 Characters

Require

Uppercase

Lowercase

Number

Special Character

------------------------------------------------------------

# PASSWORD STORAGE

Never Plain Password

Always

bcrypt Hash

Rounds

12+

------------------------------------------------------------

# LOGIN SECURITY

HTTP Only Cookie

Secure Cookie

SameSite

JWT Expiration

Refresh Token (Future)

------------------------------------------------------------

# SESSION MANAGEMENT

Current Session

Logout

Logout All Devices (Future)

Trusted Devices (Future)

------------------------------------------------------------

# ACCOUNT SECURITY

Inactive Account

Cannot Login

Deleted Account

Cannot Login

Disabled Account

Cannot Login

------------------------------------------------------------

# FAILED LOGIN

Future

5 Failed Attempts

↓

Temporary Lock

↓

15 Minutes

↓

Unlock

------------------------------------------------------------

# TWO FACTOR AUTHENTICATION

Future

Email OTP

Authenticator App

SMS OTP

Recovery Codes

------------------------------------------------------------

# AUDIT LOG

Every Login

Every Logout

Password Change

Permission Change

Billing Change

Delete Action

Must Be Logged

------------------------------------------------------------

# BUSINESS RULES

Never Trust Client Input

Always Verify JWT

Always Verify Role

Always Verify Ownership

Never Skip Permission Check

------------------------------------------------------------

# NON NEGOTIABLE SECURITY RULES

Never Store Plain Password

Never Return Password Hash

Never Store JWT In Database

Never Expose Sensitive Data

Always Use HTTP Only Cookies

Always Hash Password

Always Validate Input

Always Rate Limit Login

Always Log Sensitive Actions

------------------------------------------------------------

# CURRENT STATUS

JWT Authentication

✔

bcrypt

✔

Role System

🚧

Permission Matrix

⬜

2FA

⬜ Future

Refresh Token

⬜ Future

------------------------------------------------------------

END OF PART 3
------------------------------------------------------------

# ADMIN PANEL

Version

Enterprise Premium Edition

Purpose

Complete Business Control Center

------------------------------------------------------------

# ADMIN FLOW

Super Admin

↓

Login

↓

Dashboard

↓

Clients

↓

Events

↓

Albums

↓

Media

↓

Analytics

↓

Billing

↓

Notifications

↓

Settings

------------------------------------------------------------

# ADMIN DASHBOARD

Dashboard is the Control Center.

It should show

Total Clients

Total Events

Total Albums

Total Photos

Total Videos

Total QR Scans

Total Visitors

Total Downloads

Storage Used

Revenue

Recent Activities

Latest Clients

Latest Events

Latest Uploads

System Status

------------------------------------------------------------

# CLIENT MANAGEMENT

Purpose

Manage Photography Studios

Wedding Companies

Freelancers

------------------------------------------------------------

Client Actions

Create Client

Edit Client

Delete Client

Suspend Client

Activate Client

Reset Password

View Dashboard

Login As Client (Future)

------------------------------------------------------------

Client Information

Company Name

Owner Name

Email

Phone

Address

City

State

Country

Plan

Storage

Status

Created Date

------------------------------------------------------------

# EVENT MANAGEMENT

Every Client

↓

Unlimited Events

------------------------------------------------------------

Event Actions

Create Event

Edit Event

Delete Event

Publish

Archive

Duplicate

Generate QR

Open Viewer

------------------------------------------------------------

Event Information

Title

Bride Name

Groom Name

Slug

Date

Location

Theme

Cover

Logo

Live Status

Guest Book

QR Enabled

------------------------------------------------------------

# ALBUM MANAGEMENT

Every Event

↓

Unlimited Albums

------------------------------------------------------------

Album Actions

Create

Edit

Delete

Hide

Feature

Sort

Move

Duplicate

------------------------------------------------------------

Album Information

Title

Slug

Description

Type

Cover

Sort Order

Visibility

------------------------------------------------------------

# MEDIA MANAGEMENT

Admin Can

View Everything

Delete

Recover

Move

Transfer

Audit

------------------------------------------------------------

Media Actions

Upload

Delete

Move

Copy

Download

Replace

Compress

Generate Thumbnail

------------------------------------------------------------

# QR MANAGEMENT

Generate Event QR

Generate Album QR

Download PNG

Download SVG

Print Ready

Custom Theme

Custom Logo

Analytics

------------------------------------------------------------

# ANALYTICS

Dashboard

Visitors

Downloads

QR

Storage

Top Events

Top Albums

Top Media

Countries

Cities

Devices

Browsers

------------------------------------------------------------

# BILLING

Current

Manual

Future

Razorpay

Stripe

Invoices

Subscriptions

Taxes

------------------------------------------------------------

# STORAGE MANAGEMENT

Storage Used

Remaining

Largest Client

Largest Event

Largest Album

Largest Video

------------------------------------------------------------

# NOTIFICATIONS

Client Created

Event Created

Storage Full

Payment Failed

Plan Expired

System Alert

------------------------------------------------------------

# SETTINGS

General

Branding

Email

Security

Storage

Billing

Roles

Permissions

------------------------------------------------------------

# SEARCH

Global Search

Clients

Events

Albums

Photos

Videos

Invoices

------------------------------------------------------------

# FILTERS

Active

Inactive

Premium

Standard

Recent

Archived

Deleted

------------------------------------------------------------

# FUTURE FEATURES

Agency Dashboard

White Label

Multi Branch

Support Panel

Developer APIs

AI Analytics

AI Monitoring

------------------------------------------------------------

# BUSINESS RULES

Super Admin

Can Access Everything

Client

Can Access Own Data Only

Every Delete

Should Be Logged

Sensitive Actions

Require Confirmation

------------------------------------------------------------

# ADMIN SECURITY

JWT Required

Role Required

Ownership Validation

Rate Limiting

Audit Logging

CSRF Protection

XSS Protection

SQL Injection Protection

------------------------------------------------------------

# CURRENT STATUS

Dashboard

✔ Ready

Client CRUD

✔ Ready

Client Dashboard

✔ Base Ready

Event CRUD

🚧 In Progress

Album CRUD

⬜ Pending

Media CRUD

⬜ Pending

QR

⬜ Pending

Analytics

⬜ Pending

Billing

⬜ Future

------------------------------------------------------------

END OF PART 4
------------------------------------------------------------

# CLIENT DASHBOARD

Version

Enterprise Premium Edition

Purpose

Complete Business Dashboard For Photography Studios

------------------------------------------------------------

# CLIENT FLOW

Super Admin

↓

Create Client

↓

Client Login

↓

Dashboard

↓

Create Event

↓

Create Albums

↓

Upload Media

↓

Generate QR

↓

Publish

↓

Guest Scan

↓

Analytics

------------------------------------------------------------

# CLIENT DASHBOARD

Dashboard Should Show

Total Events

Total Albums

Total Photos

Total Videos

Storage Used

Storage Remaining

QR Scans

Visitors

Downloads

Recent Uploads

Latest Events

Subscription

Notifications

------------------------------------------------------------

# EVENT MANAGEMENT

Every Client

↓

Unlimited Events

Each Event

↓

Own Albums

↓

Own Media

↓

Own QR

↓

Own Analytics

------------------------------------------------------------

# EVENT ACTIONS

Create Event

Edit Event

Delete Event

Duplicate Event

Archive Event

Publish Event

Generate QR

Open Viewer

------------------------------------------------------------

# EVENT INFORMATION

Title

Bride Name

Groom Name

Client Name

Event Date

Location

Theme Color

Logo

Cover Image

Live Status

Guest Book

QR Enabled

------------------------------------------------------------

# ALBUM MANAGEMENT

Each Event

↓

Unlimited Albums

------------------------------------------------------------

Album Actions

Create Album

Edit Album

Delete Album

Hide Album

Feature Album

Sort Album

Duplicate Album

------------------------------------------------------------

Album Information

Title

Slug

Description

Album Type

Cover Image

Sort Order

Visibility

------------------------------------------------------------

# MEDIA MANAGEMENT

Supported Types

Photos

Videos

------------------------------------------------------------

Photo Formats

JPG

JPEG

PNG

WEBP

HEIC (Future)

RAW (Future)

------------------------------------------------------------

Video Formats

MP4

MOV

AVI

WEBM

Future

4K

8K

------------------------------------------------------------

# MEDIA ACTIONS

Upload

Delete

Replace

Move

Copy

Compress

Generate Thumbnail

Rotate

Favorite

Hide

------------------------------------------------------------

# MEDIA UPLOAD FLOW

Create Event

↓

Create Album

↓

Upload Photos

↓

Generate Thumbnail

↓

Compress Image

↓

Save Metadata

↓

Ready For Viewer

------------------------------------------------------------

# STORAGE

Track

Photos

Videos

Original Files

Compressed Files

Thumbnail Files

Total Storage

Remaining Storage

------------------------------------------------------------

# STORAGE WARNINGS

70%

Warning

85%

Critical

95%

Almost Full

100%

Uploads Blocked

------------------------------------------------------------

# ANALYTICS

Total Visitors

Unique Visitors

Downloads

QR Scans

Top Albums

Top Photos

Top Videos

Countries

Cities

Devices

------------------------------------------------------------

# NOTIFICATIONS

Storage Full

Event Published

Upload Completed

Plan Expiring

New Visitor Milestone

------------------------------------------------------------

# CLIENT SETTINGS

Profile

Company

Logo

Theme

Password

Gallery Settings

Download Settings

QR Settings

------------------------------------------------------------

# TEAM MANAGEMENT

Future

Manager

Photographer

Editor

Uploader

Viewer Manager

------------------------------------------------------------

# SUBSCRIPTION

Current Plan

Storage

Renewal Date

Expiry Date

Upgrade Plan

Future

Auto Renewal

------------------------------------------------------------

# BUSINESS RULES

Client

Can Access

Own Data Only

Client

Cannot

Access Other Client Data

Every Request

Must Verify Ownership

------------------------------------------------------------

# CLIENT SECURITY

JWT Authentication

Ownership Validation

Audit Logging

Rate Limiting

Secure Upload

Signed URLs

------------------------------------------------------------

# CURRENT STATUS

Dashboard

✔ Ready

Events

🚧 In Progress

Albums

⬜ Pending

Media Upload

⬜ Pending

QR

⬜ Pending

Analytics

⬜ Pending

Storage

⬜ Pending

Subscription

⬜ Future

------------------------------------------------------------

END OF PART 5
------------------------------------------------------------

# VIEWER PANEL + QR SYSTEM + GUEST EXPERIENCE

Version

Enterprise Premium Edition

Purpose

World Class Guest Experience

------------------------------------------------------------

# VIEWER FLOW

Guest

↓

QR Scan

↓

Welcome Screen

↓

Gallery

↓

Albums

↓

Photos

↓

Videos

↓

Guest Book

↓

Downloads

↓

Share

↓

Exit

------------------------------------------------------------

# WELCOME SCREEN

Cover Image

Bride Name

Groom Name

Event Date

Countdown

Location

Background Music

Enter Gallery Button

------------------------------------------------------------

# GALLERY

Premium Masonry Layout

Infinite Scroll

Lazy Loading

Blur Placeholder

Responsive Grid

Apple Level Smooth

------------------------------------------------------------

# ALBUMS

Unlimited Albums

Album Cover

Album Description

Album Type

Photo Count

Video Count

Sort Order

------------------------------------------------------------

# PHOTO VIEWER

Fullscreen

Zoom

Pinch

Double Tap

Next

Previous

Download

Share

Favorite

Slideshow

------------------------------------------------------------

# VIDEO VIEWER

Fullscreen

Play

Pause

Seek

Volume

Playback Speed

Download

Share

Future Streaming

------------------------------------------------------------

# DOWNLOAD SYSTEM

Original Download

Compressed Download

Watermarked Download

ZIP Album

ZIP Event

Permission Based

------------------------------------------------------------

# SHARE SYSTEM

WhatsApp

Instagram

Facebook

Telegram

Copy Link

QR Share

------------------------------------------------------------

# QR SYSTEM

Event QR

Album QR

Invitation QR

VIP QR

Download QR

Future Dynamic QR

------------------------------------------------------------

# QR FEATURES

Custom Logo

Custom Color

PNG Export

SVG Export

Print Ready

Analytics

Expiry Date

------------------------------------------------------------

# GUEST BOOK

Guest Name

Message

Emoji

Photo

Future

Voice Message

Video Message

------------------------------------------------------------

# COMMENTS

Photo Comments

Video Comments

Replies

Likes

Report

Moderation

------------------------------------------------------------

# LIVE FEATURES

Future

Live Upload

Live Gallery

Live Reactions

Live Chat

Live Slideshow

------------------------------------------------------------

# ANALYTICS

QR Scans

Visitors

Downloads

Top Albums

Top Photos

Top Videos

Countries

Cities

Devices

Browsers

Session Time

------------------------------------------------------------

# PREMIUM UI

Glassmorphism

Micro Animations

Smooth Transitions

Premium Cards

Premium Buttons

Luxury Typography

------------------------------------------------------------

# PERFORMANCE

Image Optimization

WebP

AVIF

Thumbnail First

CDN Ready

Lazy Loading

Infinite Scroll

------------------------------------------------------------

# SECURITY

Signed URLs

Temporary URLs

Token Validation

No Direct Storage Access

Hotlink Protection

Ownership Validation

------------------------------------------------------------

# FUTURE AI FEATURES

AI Face Recognition

AI Smart Albums

AI Search

AI Slideshow

AI Highlight Reel

AI Memory Timeline

AI Best Photo

AI Caption Generator

------------------------------------------------------------

# BUSINESS RULES

Guest

Can

View

Download (If Allowed)

Share

Comment

Guest Cannot

Upload

Delete

Edit

Access Private Data

------------------------------------------------------------

# CURRENT STATUS

Viewer

⬜ Pending

Gallery

⬜ Pending

Albums

⬜ Pending

Photo Viewer

⬜ Pending

Video Viewer

⬜ Pending

QR

⬜ Pending

Guest Book

⬜ Pending

Downloads

⬜ Pending

AI

⬜ Future

------------------------------------------------------------

END OF PART 6
------------------------------------------------------------

# ENTERPRISE SECURITY BLUEPRINT

Security Level

Enterprise Grade

Zero Trust Architecture

Defense In Depth

Secure By Default

------------------------------------------------------------

# SECURITY LAYERS

Layer 1

HTTPS

↓

Layer 2

Authentication

↓

Layer 3

Authorization

↓

Layer 4

Ownership Validation

↓

Layer 5

Input Validation

↓

Layer 6

Database Protection

↓

Layer 7

Audit Logging

↓

Layer 8

Rate Limiting

------------------------------------------------------------

# AUTHENTICATION

JWT

HTTP Only Cookies

bcrypt Password Hash

Future

Refresh Tokens

2FA

OTP

Trusted Devices

------------------------------------------------------------

# AUTHORIZATION

Role Based Access

Ownership Validation

Permission Matrix

Client Isolation

------------------------------------------------------------

# API SECURITY

Every API Must

Authenticate User

Validate Role

Validate Ownership

Validate Input

Return Safe Errors

Log Sensitive Actions

------------------------------------------------------------

# FILE UPLOAD SECURITY

Allowed MIME Types

Allowed Extensions

Maximum File Size

Image Validation

Video Validation

Future

Virus Scan

Malware Scan

------------------------------------------------------------

# DATABASE SECURITY

Prisma ORM

Prepared Queries

Foreign Keys

Indexes

Transactions

No Raw SQL

Unless Absolutely Required

------------------------------------------------------------

# PASSWORD RULES

Never Store Plain Password

Always bcrypt Hash

Minimum 12 Salt Rounds

Never Return Password Hash

Never Log Password

------------------------------------------------------------

# CLIENT ISOLATION

Client A

Cannot Read

Client B Data

Client A

Cannot Edit

Client B Data

Client A

Cannot Delete

Client B Data

Every Query

Must Verify

Client Ownership

------------------------------------------------------------

# AUDIT LOGGING

Log

Login

Logout

Password Change

Client Create

Client Delete

Event Create

Album Delete

Upload

Download

Payment

Settings Change

------------------------------------------------------------

# API SUMMARY

Authentication

/api/login

/api/logout

/api/me

-----------------------

Clients

/api/clients

/api/clients/:id

-----------------------

Events

/api/events

/api/events/:id

-----------------------

Albums

/api/albums

/api/albums/:id

-----------------------

Media

/api/media

/api/upload

-----------------------

QR

/api/qr

/api/qr/:id

-----------------------

Analytics

/api/analytics

-----------------------

Guest Book

/api/guestbook

-----------------------

Billing

/api/subscription

/api/payment

/api/invoice

------------------------------------------------------------

# CODING STANDARDS

Language

TypeScript Only

React

Functional Components

Next.js

App Router

TailwindCSS

Utility First

Prisma

Only ORM

Absolute Imports

Only

Never

Relative ../../../ Imports

------------------------------------------------------------

# NAMING CONVENTIONS

Components

PascalCase

Example

ClientCard.tsx

AlbumGrid.tsx

ViewerModal.tsx

-----------------------

Functions

camelCase

Example

createEvent()

generateSlug()

uploadMedia()

-----------------------

Variables

camelCase

-----------------------

Constants

UPPER_CASE

-----------------------

Folders

lowercase

------------------------------------------------------------

# UI RULES

Apple Level Feel

Smooth Animations

Glassmorphism

Rounded Corners

Premium Shadows

Responsive

Mobile First

Dark Theme

Consistent Spacing

Professional Typography

------------------------------------------------------------

# PERFORMANCE RULES

Lazy Loading

Code Splitting

Image Optimization

WebP

AVIF

Infinite Scroll

Pagination

Caching

Future

Redis

CDN

------------------------------------------------------------

# THIRD PARTY PACKAGES

Next.js

React

TypeScript

TailwindCSS

Prisma

PostgreSQL

bcrypt

jsonwebtoken

zod

react-hook-form

lucide-react

Future

Redis

AWS SDK

Cloudflare R2

ImageKit

Razorpay

Stripe

FFmpeg

------------------------------------------------------------

# ENVIRONMENT VARIABLES

DATABASE_URL

JWT_SECRET

NEXTAUTH_SECRET (Future)

BCRYPT_ROUNDS

UPLOAD_PATH

APP_URL

NODE_ENV

Future

REDIS_URL

AWS_ACCESS_KEY

AWS_SECRET_KEY

RAZORPAY_KEY

STRIPE_SECRET

------------------------------------------------------------

# BUSINESS RULES

One Client

Can Have

Unlimited Events

One Event

Can Have

Unlimited Albums

One Album

Can Have

Unlimited Photos

Unlimited Videos

Every Event

Has Unique Slug

Every Album

Has Unique Slug

Inside Event

Every Sensitive Action

Must Be Logged

------------------------------------------------------------

# TAHELKA MACHANE WALA VISION

Target

World's Best Event Gallery Platform

Features

Premium UI

Enterprise Security

AI Powered Gallery

AI Search

AI Slideshow

White Label

Custom Domain

Agency Support

Multi Tenant

Real Time Upload

Cloud Storage

4K / 8K Support

Apple Level Experience

------------------------------------------------------------

# FUTURE ROADMAP

Phase 1

Authentication

✔

Phase 2

Client Management

✔

Phase 3

Event System

🚧

Phase 4

Album System

⬜

Phase 5

Media Upload

⬜

Phase 6

Viewer

⬜

Phase 7

QR

⬜

Phase 8

Analytics

⬜

Phase 9

Billing

⬜

Phase 10

AI Platform

⬜

------------------------------------------------------------

# CURRENT PROJECT STATUS

Authentication

✔ Complete

Client CRUD

✔ Complete

Client Dashboard

✔ Base Ready

Event CRUD

🚧 In Progress

Album CRUD

⬜ Pending

Media Upload

⬜ Pending

QR System

⬜ Pending

Viewer

⬜ Pending

Analytics

⬜ Pending

Billing

⬜ Future

AI

⬜ Future

------------------------------------------------------------

# NEXT TASK

1. Complete Event CRUD
2. Complete Album CRUD
3. Build Media Upload
4. Build Gallery
5. Build QR System
6. Build Viewer
7. Build Analytics
8. Build Billing
9. Add AI Features
10. Production Deployment

------------------------------------------------------------

# NON-NEGOTIABLE RULES

✓ Never store plain passwords

✓ Always hash passwords with bcrypt

✓ Always validate ownership

✓ Never trust client-side data

✓ Always use Prisma ORM

✓ Never expose sensitive APIs

✓ Always use enterprise folder structure

✓ Always keep UI premium

✓ Every feature must be scalable

✓ Every API must be secure

✓ Every component must be reusable

✓ Every page must support responsive design

✓ Never compromise on security

✓ Never compromise on code quality

✓ Never compromise on user experience

------------------------------------------------------------

END OF PROJECT_MASTER.md