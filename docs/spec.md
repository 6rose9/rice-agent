# စပါးအောင်သွယ်

## Gist

A professional networking and marketplace platform for Myanmar's rice industry. စပါးအောင်သွယ် connects farmers, traders, agents, and app users in a single platform where all user types can build professional profiles, publish buying and selling opportunities, follow industry participants, and discover trusted business connections.

The platform combines the networking experience of LinkedIn with the trading and discovery capabilities of a marketplace, helping participants in the rice supply chain find opportunities more efficiently.

---

## Story

Rice trading in Myanmar is often conducted through Facebook groups, phone calls, personal contacts, and messaging applications. Information is fragmented, opportunities are difficult to discover, and trust is built slowly through personal networks.

A farmer may have rice available for sale but struggle to find reliable buyers. A trader may need a large quantity of rice but not know which farmers currently have stock available. Agents often spend significant time manually connecting buyers and sellers.

စပါးအောင်သွယ် provides a dedicated platform where industry participants can create professional profiles, publish market opportunities, indicate their current business status, and build trusted networks within the rice ecosystem.

For example, a farmer can set a status of "Looking for Buyers" in their profile and publish a selling post. A trader searching for suppliers can discover the farmer through filters, follow their profile, and initiate a business relationship.

---

## Why

### Industry-Specific Network

Unlike general social media platforms, စပါးအောင်သွယ် is designed specifically for rice trading and agricultural networking.

### Better Discovery

Users can search and filter by role, location, rice type, and business status.

### Professional Identity

Profiles help establish credibility and long-term business relationships.

### Market Visibility

Farmers, traders, and agents can publicly communicate opportunities and needs.

### Future Growth

The platform can later support ratings, verification, market insights, messaging, and trade history.

---

## Why Not

### Not an E-Commerce Platform

The platform does not process payments or handle logistics. Transactions occur outside the platform.

### Not a General Social Network

The primary focus is professional networking and rice trading rather than entertainment or general content sharing.

### Not a Commodity Exchange

စပါးအောင်သွယ် facilitates connections between participants but does not act as a broker or trading exchange.

### Not a Full ERP System

Inventory management, accounting, and warehouse management are outside the scope of Version 1.

---

## Tech Spec

### Stack

#### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

#### Backend Services

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage

#### Deployment

* Vercel
* Supabase

### User Roles

* Farmer
* Trader
* Agent
* General User

### Development Steps

#### Step 1 — Project Setup

* Create Next.js project
* Configure TypeScript
* Configure Tailwind CSS
* Install shadcn/ui
* Create Supabase project
* Connect Supabase with Next.js

#### Step 2 — Authentication

Features:

* Register
* Login
* Logout
* Protected Routes

#### Step 3 — Profiles

Features:

* Create profile
* Edit profile
* Upload profile photo
* Select role
* Add about section
* Add location
* Select market status

#### Step 4 — Posts

Features:

* Create buying posts
* Create selling posts
* Upload post images
* Edit posts
* Delete posts

#### Step 5 — Feed

Features:

* View latest posts
* View posts from followed users

#### Step 6 — Search

Features:

* Search users
* Filter by role
* Filter by status
* Filter by location
* Search posts
* Filter by rice type
* Filter by price
* Filter by location

#### Step 7 — Network

Features:

* Follow users
* Unfollow users
* Followers list
* Following list

### Core Features (V1)

#### Authentication

* Register
* Login
* Logout

#### Profiles

* User information
* Role selection
* Profile photo
* About section
* Location
* Status badges

#### Market Status

Examples:

* Looking for Buyers
* Looking for Suppliers
* Buying Rice
* Selling Rice
* Available as Agent
* Open for Partnership

#### Posts

* Buying posts
* Selling posts
* Images
* Location information

#### Feed

* View latest posts
* View posts from followed users

#### Network

* Follow users
* Unfollow users
* Followers list
* Following list

#### Search

* Search users
* Filter by role
* Filter by status
* Filter by location

### Database Tables

* users
* profiles
* posts
* post_images
* follows

---

## Definition of Done

### Project Setup

* [ ] Next.js project created
* [ ] Supabase project configured
* [ ] Database connected
* [ ] Storage configured

### Authentication

* [ ] Users can register
* [ ] Users can log in
* [ ] Users can log out

### Profiles

* [ ] Users can create profiles
* [ ] Users can upload profile photos
* [ ] Users can edit profile information
* [ ] Users can select a role
* [ ] Users can manage statuses

### Posts

* [ ] Users can create selling posts
* [ ] Users can create buying posts
* [ ] Users can upload post images
* [ ] Users can edit their posts
* [ ] Users can delete their posts

### Feed

* [ ] Users can view latest posts
* [ ] Feed displays post information correctly
* [ ] Feed is responsive on mobile and desktop

### Network

* [ ] Users can follow other users
* [ ] Users can unfollow users
* [ ] Users can view followers
* [ ] Users can view following

### Search

* [ ] Search users by name
* [ ] Filter by role
* [ ] Filter by status
* [ ] Filter by location

### UI/UX

* [ ] Responsive design
* [ ] Mobile-friendly layout
* [ ] Consistent design system
* [ ] Accessible navigation

### Deployment

* [ ] Frontend deployed on Vercel
* [ ] Database deployed on Supabase
* [ ] Storage working
* [ ] Production environment working

