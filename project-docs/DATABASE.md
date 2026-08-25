# DATABASE.md

# PART 1

# DATABASE ARCHITECTURE

Project

EventQR Live

Version

Enterprise Premium Edition

--------------------------------------------------

# DATABASE

Engine

PostgreSQL

ORM

Prisma ORM

Migration

Prisma Migration

--------------------------------------------------

# DATABASE GOAL

Database

Completely Relational

Highly Scalable

Secure

Enterprise Ready

Multi Tenant

--------------------------------------------------

# DATABASE DESIGN

Super Admin

↓

Clients

↓

Events

↓

Albums

↓

Media

↓

QR

↓

Visitors

↓

Analytics

↓

Downloads

↓

Guest Book

--------------------------------------------------

# DATABASE PRINCIPLES

No Duplicate Data

Proper Relations

Foreign Keys

Indexes

Unique Slugs

Soft Delete Ready

Future Partition Support

--------------------------------------------------

# MAIN MODELS

User

Client

Event

Album

Media

QRCode

GuestBook

Visitor

DownloadLog

Notification

Subscription

Invoice

Payment

AuditLog

StorageUsage

ActivityLog

--------------------------------------------------

# USER MODEL

Purpose

System Login

Roles

SUPER_ADMIN

ADMIN

CLIENT

MANAGER

EDITOR

PHOTOGRAPHER

UPLOADER

VIEWER_MANAGER

Future

ACCOUNTANT

SUPPORT

--------------------------------------------------

# CLIENT MODEL

Purpose

Studio

Photographer

Company

Fields

Company Name

Owner

Phone

Email

Address

Plan

Storage

Status

Login

Password Hash

Viewer Login Required

--------------------------------------------------

# EVENT MODEL

Purpose

Every Wedding

Birthday

Corporate Event

Belongs To

Client

Contains

Albums

QR

Analytics

Guest Book

--------------------------------------------------

# ALBUM MODEL

Purpose

Organize Media

Belongs To

Event

Contains

Photos

Videos

--------------------------------------------------

# MEDIA MODEL

Purpose

Photo

Video

Belongs To

Album

Stores

Original

Thumbnail

Compressed

Metadata

--------------------------------------------------

# QR MODEL

Purpose

Generate QR

Belongs To

Event

Album

Future

Invitation

VIP

Download

--------------------------------------------------

# VISITOR MODEL

Purpose

Track Visitors

Stores

IP

Country

City

Browser

Device

Time

Referrer

--------------------------------------------------

# DOWNLOAD LOG

Purpose

Track Downloads

Stores

Media

Album

User

Time

IP

--------------------------------------------------

# GUEST BOOK

Purpose

Wedding Wishes

Stores

Guest Name

Message

Emoji

Future

Voice

Video

--------------------------------------------------

# SUBSCRIPTION

Purpose

Client Plan

Stores

Plan

Price

Storage

Renewal

Expiry

Status

--------------------------------------------------

# PAYMENT

Purpose

Billing

Stores

Amount

Gateway

Status

Invoice

Transaction ID

--------------------------------------------------

# AUDIT LOG

Purpose

Track Every Action

Stores

User

Action

Time

IP

Device

--------------------------------------------------

# STORAGE USAGE

Purpose

Track Storage

Stores

Used

Remaining

Limit

Growth

--------------------------------------------------

# ACTIVITY LOG

Purpose

Track

Every Important Activity

Login

Logout

Upload

Delete

Download

Share

--------------------------------------------------

# CURRENT STATUS

Database

✔ PostgreSQL

ORM

✔ Prisma

Models

🚧 Under Development

Indexes

⬜ Pending

Optimization

⬜ Pending

--------------------------------------------------

END OF PART 1
# DATABASE.md

# PART 2

# DATABASE RELATIONSHIPS

Version

Enterprise Premium Edition

--------------------------------------------------

# COMPLETE DATABASE FLOW

SUPER ADMIN

↓

CLIENT

↓

EVENT

↓

ALBUM

↓

MEDIA

↓

VISITOR

↓

DOWNLOAD

↓

ANALYTICS

--------------------------------------------------

# RELATION DIAGRAM

User

1

↓

N

Clients

↓

1

↓

N

Events

↓

1

↓

N

Albums

↓

1

↓

N

Media

--------------------------------------------------

# USER

Purpose

Authentication

Roles

SUPER_ADMIN

ADMIN

CLIENT

MANAGER

EDITOR

PHOTOGRAPHER

UPLOADER

--------------------------------------------------

# USER RELATIONS

User

↓

Many Clients

User

↓

Many Events

User

↓

Many Audit Logs

User

↓

Many Activity Logs

--------------------------------------------------

# CLIENT RELATIONS

Client

↓

One Owner

↓

Many Events

↓

One Subscription

↓

Many Notifications

↓

Many Activity Logs

--------------------------------------------------

# EVENT RELATIONS

Event

↓

Belongs To Client

↓

Belongs To User

↓

Many Albums

↓

One QR

↓

Many Visitors

↓

Many Guest Book Entries

↓

Many Analytics

--------------------------------------------------

# ALBUM RELATIONS

Album

↓

Belongs To Event

↓

Many Media

--------------------------------------------------

# MEDIA RELATIONS

Media

↓

Belongs To Album

↓

Many Downloads

↓

Many Shares

↓

Many Analytics

--------------------------------------------------

# QR RELATIONS

QR

↓

Belongs To Event

Future

↓

Belongs To Album

↓

Invitation

↓

VIP

--------------------------------------------------

# VISITOR RELATIONS

Visitor

↓

Belongs To Event

Stores

Country

State

City

Browser

Device

IP

Session

--------------------------------------------------

# DOWNLOAD RELATIONS

Download Log

↓

Belongs To Media

↓

Belongs To Event

↓

Belongs To Client

--------------------------------------------------

# GUEST BOOK RELATIONS

Guest Book

↓

Belongs To Event

Future

↓

Belongs To Guest Profile

--------------------------------------------------

# SUBSCRIPTION RELATIONS

Subscription

↓

Belongs To Client

↓

One Active Plan

--------------------------------------------------

# PAYMENT RELATIONS

Payment

↓

Belongs To Subscription

↓

One Invoice

--------------------------------------------------

# INVOICE RELATIONS

Invoice

↓

Belongs To Client

↓

Belongs To Payment

--------------------------------------------------

# AUDIT LOG RELATIONS

Audit Log

↓

Belongs To User

Stores

Every Important Action

--------------------------------------------------

# STORAGE RELATIONS

Storage Usage

↓

Belongs To Client

Tracks

Current Usage

Remaining Storage

Growth

--------------------------------------------------

# FOREIGN KEYS

User

↓

Client

Client

↓

Event

Event

↓

Album

Album

↓

Media

Media

↓

Download Log

Subscription

↓

Payment

Payment

↓

Invoice

--------------------------------------------------

# CASCADE DELETE RULES

Delete Client

↓

Delete Events

↓

Delete Albums

↓

Delete Media

↓

Delete QR

↓

Delete Analytics

↓

Delete Downloads

↓

Delete Guest Book

--------------------------------------------------

# RESTRICT DELETE

User

Cannot Delete

If

Clients Exist

Subscription

Cannot Delete

If

Payments Exist

Invoice

Never Delete

Archive Only

--------------------------------------------------

# UNIQUE CONSTRAINTS

User Email

Unique

Login ID

Unique

Event Slug

Unique

Album Slug

Unique Inside Event

QR Token

Unique

Invoice Number

Unique

Transaction ID

Unique

--------------------------------------------------

# DATABASE INDEXES

User Email

User Login ID

Client Login ID

Client Company

Event Slug

Event Date

Album Slug

Media Album

Visitor Event

Download Media

Invoice Number

Payment Status

--------------------------------------------------

# OPTIMIZATION

Foreign Keys

Indexed Columns

Composite Indexes

Pagination Ready

Cursor Pagination Ready

Future Partition Support

--------------------------------------------------

# CURRENT STATUS

Relations

✔ Designed

Indexes

⬜ Pending

Optimization

⬜ Pending

Cascade Rules

✔ Planned

--------------------------------------------------

END OF PART 2
# DATABASE.md

# PART 3

# PRISMA MODEL DOCUMENTATION

Version

Enterprise Premium Edition

--------------------------------------------------

# USER MODEL

Purpose

System Authentication

Stores

Super Admin

Admins

Client Login

Managers

Editors

Photographers

Uploaders

--------------------------------------------------

# USER FIELDS

id

Primary Key

UUID / CUID

email

Unique

Login Email

loginId

Unique Username

passwordHash

Encrypted Password

role

System Role

isActive

Account Status

lastLogin

Last Login Time

createdAt

Creation Time

updatedAt

Update Time

--------------------------------------------------

# CLIENT MODEL

Purpose

Photography Studio

Wedding Company

Business Owner

--------------------------------------------------

# CLIENT FIELDS

id

Primary Key

adminId

Created By

companyName

Studio Name

contactPerson

Owner Name

email

Business Email

phone

Phone Number

address

Address

city

City

state

State

country

Country

plan

Subscription Plan

loginId

Client Username

passwordHash

Encrypted Password

viewerLoginRequired

Gallery Login Required

storageLimitGB

Maximum Storage

storageDays

Auto Delete Days

isActive

Client Status

createdAt

updatedAt

--------------------------------------------------

# EVENT MODEL

Purpose

Wedding

Birthday

Corporate Event

--------------------------------------------------

# EVENT FIELDS

id

clientId

adminId

title

slug

brideName

groomName

clientName

type

status

eventDate

location

coverImage

logo

themeColor

qrEnabled

guestBook

isLive

createdAt

updatedAt

--------------------------------------------------

# ALBUM MODEL

Purpose

Organize Media

--------------------------------------------------

# ALBUM FIELDS

id

eventId

title

slug

type

coverImage

description

sortOrder

isHidden

createdAt

updatedAt

--------------------------------------------------

# MEDIA MODEL

Purpose

Store Photos

Store Videos

--------------------------------------------------

# MEDIA FIELDS

id

albumId

type

title

fileName

originalName

mimeType

extension

size

width

height

duration

thumbnail

compressedFile

originalFile

watermarkedFile

storagePath

isFavorite

isHidden

uploadedBy

createdAt

updatedAt

--------------------------------------------------

# QR MODEL

Purpose

Generate Secure QR

--------------------------------------------------

# QR FIELDS

id

eventId

albumId

token

url

type

expiryDate

scanCount

isActive

createdAt

--------------------------------------------------

# VISITOR MODEL

Purpose

Track Visitors

--------------------------------------------------

# VISITOR FIELDS

id

eventId

country

state

city

ip

browser

device

os

referrer

sessionId

visitedAt

--------------------------------------------------

# DOWNLOAD LOG MODEL

Purpose

Track Downloads

--------------------------------------------------

# DOWNLOAD LOG FIELDS

id

mediaId

eventId

clientId

visitorId

downloadType

ip

device

browser

downloadedAt

--------------------------------------------------

# GUEST BOOK MODEL

Purpose

Wedding Wishes

--------------------------------------------------

# GUEST BOOK FIELDS

id

eventId

guestName

message

emoji

photo

voice

video

status

createdAt

--------------------------------------------------

# NOTIFICATION MODEL

Purpose

Send Alerts

--------------------------------------------------

# NOTIFICATION FIELDS

id

clientId

title

message

type

isRead

createdAt

--------------------------------------------------

# SUBSCRIPTION MODEL

Purpose

Client Plans

--------------------------------------------------

# SUBSCRIPTION FIELDS

id

clientId

plan

price

storage

startDate

expiryDate

status

autoRenew

createdAt

--------------------------------------------------

# PAYMENT MODEL

Purpose

Payment History

--------------------------------------------------

# PAYMENT FIELDS

id

subscriptionId

amount

gateway

transactionId

status

currency

paidAt

--------------------------------------------------

# INVOICE MODEL

Purpose

Billing

--------------------------------------------------

# INVOICE FIELDS

id

paymentId

invoiceNumber

gst

subtotal

tax

total

status

pdfUrl

createdAt

--------------------------------------------------

# STORAGE MODEL

Purpose

Track Storage

--------------------------------------------------

# STORAGE FIELDS

id

clientId

usedGB

remainingGB

totalGB

photos

videos

lastCalculated

--------------------------------------------------

# AUDIT LOG MODEL

Purpose

Track Every Action

--------------------------------------------------

# AUDIT LOG FIELDS

id

userId

action

entity

entityId

ip

browser

device

createdAt

--------------------------------------------------

# ACTIVITY LOG MODEL

Purpose

User Timeline

--------------------------------------------------

# ACTIVITY LOG FIELDS

id

clientId

eventId

activity

description

createdAt

--------------------------------------------------

# BUSINESS RULES

User

↓

Many Clients

Client

↓

Many Events

Event

↓

Many Albums

Album

↓

Many Media

Media

↓

Many Downloads

Everything

Linked

Using Foreign Keys

--------------------------------------------------

# CURRENT STATUS

Schema

🚧 In Progress

Relations

✔ Designed

Indexes

⬜ Pending

Optimization

⬜ Pending

--------------------------------------------------

END OF PART 3
# DATABASE.md

# PART 4

# DATABASE OPTIMIZATION + SECURITY + FUTURE ROADMAP

Version

Enterprise Premium Edition

--------------------------------------------------

# DATABASE PERFORMANCE

Goal

Fast

Scalable

Reliable

Enterprise Grade

--------------------------------------------------

# INDEX STRATEGY

Primary Keys

Indexed

Foreign Keys

Indexed

Email

Indexed

Login ID

Indexed

Slug

Indexed

Event Date

Indexed

Created At

Indexed

Status

Indexed

QR Token

Indexed

Transaction ID

Indexed

Invoice Number

Indexed

--------------------------------------------------

# COMPOSITE INDEXES

Client + Event Date

Client + Status

Album + Sort Order

Media + Album

Media + Type

Visitor + Event

Download + Media

Analytics + Event

--------------------------------------------------

# QUERY OPTIMIZATION

Select Only Required Fields

Use Pagination

Cursor Pagination

Avoid N+1 Queries

Use Prisma Include Carefully

Use Relation Loading

Future Read Replicas

--------------------------------------------------

# PAGINATION

Offset Pagination

Cursor Pagination

Infinite Scroll

Lazy Loading

--------------------------------------------------

# MEDIA STORAGE

Database

↓

Stores Metadata Only

Images

↓

Object Storage

Videos

↓

Object Storage

Never Store Large Files

Inside PostgreSQL

--------------------------------------------------

# STORAGE PROVIDERS

Current

Local Storage

Future

AWS S3

Cloudflare R2

Google Cloud Storage

Azure Blob

DigitalOcean Spaces

--------------------------------------------------

# BACKUP STRATEGY

Automatic Backup

Daily

Weekly

Monthly

Manual Backup

Before Every Major Release

--------------------------------------------------

# RESTORE STRATEGY

Point In Time Restore

Database Restore

Media Restore

Configuration Restore

--------------------------------------------------

# MIGRATION RULES

Always

Create Migration

↓

Review

↓

Test

↓

Deploy

Never

Edit Existing Migration

In Production

--------------------------------------------------

# SOFT DELETE

Future

Client

DeletedAt

Event

DeletedAt

Album

DeletedAt

Media

DeletedAt

GuestBook

DeletedAt

Never Physically Delete

Important Business Data

--------------------------------------------------

# HARD DELETE

Allowed Only For

Temporary Files

Cache

Logs

Expired Sessions

--------------------------------------------------

# MULTI TENANT ARCHITECTURE

Super Admin

↓

Many Clients

↓

Each Client

Own Events

Own Albums

Own Media

Own Analytics

Own Storage

No Cross Access

--------------------------------------------------

# DATA ISOLATION

Client A

Cannot Access

Client B Data

Every Query

Must Verify Ownership

--------------------------------------------------

# DATABASE SECURITY

Encrypted Password

bcrypt

Never Plain Password

Prepared Queries

Prisma ORM

SQL Injection Protection

Ownership Validation

Authentication Required

Authorization Required

Rate Limiting

Audit Logging

--------------------------------------------------

# ENTERPRISE SECURITY

Future

Database Encryption

Transparent Data Encryption

Encrypted Backups

Secrets Manager

Database Firewall

--------------------------------------------------

# AUDIT SYSTEM

Every Important Action

Must Be Logged

Login

Logout

Create

Update

Delete

Download

Share

Payment

--------------------------------------------------

# DATA RETENTION

Logs

180 Days

Analytics

Unlimited

Payments

Unlimited

Invoices

Unlimited

Media

Depends On Plan

--------------------------------------------------

# MONITORING

Future

Slow Queries

CPU Usage

Memory Usage

Storage Usage

Connection Count

Database Health

--------------------------------------------------

# FUTURE SCALING

Read Replicas

Database Sharding

Partition Tables

Caching Layer

Redis

ElasticSearch

Vector Database

AI Indexes

--------------------------------------------------

# DISASTER RECOVERY

Automatic Backup

Multiple Regions

Restore Testing

Failover Ready

--------------------------------------------------

# NON NEGOTIABLE RULES

Never Store Plain Password

Never Store JWT In Database

Never Trust Client Input

Always Validate Ownership

Always Use Prisma

Always Use Transactions

Always Keep Foreign Keys

Always Index Frequently Queried Fields

--------------------------------------------------

# CURRENT STATUS

PostgreSQL

✔

Prisma ORM

✔

Relations

✔

Optimization

🚧 Pending

Read Replicas

⬜ Future

Redis

⬜ Future

ElasticSearch

⬜ Future

--------------------------------------------------

# DATABASE ROADMAP

Phase 1

Schema

✔

Phase 2

Relations

✔

Phase 3

Optimization

⬜

Phase 4

Caching

⬜

Phase 5

AI Search

⬜

Phase 6

Multi Region

⬜

--------------------------------------------------

END OF DATABASE.md