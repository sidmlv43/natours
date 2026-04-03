# Natours Application

A full-stack tour booking application built with modern technologies: Node.js, Express, MongoDB, Mongoose, and more. This application allows users to browse tours, book them, leave reviews, and manage their accounts.

## Features

- User authentication and authorization
- Tour browsing and booking
- Review system
- Payment integration with Stripe
- Email notifications
- Image upload and processing
- Geospatial queries for tours
- Admin panel for managing tours, users, and bookings

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd natours
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `config.env` file in the root directory with the following variables:

   ```
   DB_URI=mongodb://127.0.0.1:27017/natours
   PORT=8000
   NODE_ENV=development
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRES_IN=90d
   EMAIL_USERNAME=your-email-username
   EMAIL_PASSWORD=your-email-password
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   ```

4. Start MongoDB locally or update DB_URI for your database.

5. Run the application:
   ```
   npm start
   ```

## Scripts

- `npm start`: Start the server with nodemon
- `npm run start:prod`: Start the server in production mode
- `npm run debug`: Debug the server
- `npm run watch:js`: Watch and bundle JavaScript files
- `npm run build:js`: Build JavaScript bundle

## API Documentation

### Query Parameters

The API supports the following query parameters for GET requests on resource collections (e.g., `/api/v1/tours`):

- **Filtering**: Use field names as query parameters. For example:

  - `?difficulty=easy` - Filter tours by difficulty
  - `?price[lte]=1000` - Filter tours with price less than or equal to 1000
  - Supported operators: `gte` (greater than or equal), `gt` (greater than), `lte` (less than or equal), `lt` (less than)

- **Sorting**: `?sort=field1,field2` - Sort by multiple fields (use `-` for descending, e.g., `?sort=-price,ratingsAvg`)

- **Field Limiting**: `?fields=field1,field2` - Include only specified fields in response

- **Pagination**:
  - `?page=2` - Page number (default: 1)
  - `?limit=10` - Number of results per page (default: 100)

Example: `GET /api/v1/tours?difficulty=easy&price[lte]=1000&sort=-price&fields=name,price,duration&page=1&limit=5`

### Data Models

#### Tour

```json
{
  "name": "String (required, unique, 10-40 chars)",
  "duration": "Number (required)",
  "maxGroupSize": "Number (required)",
  "difficulty": "String (required: 'easy', 'medium', 'difficult')",
  "ratingsAvg": "Number (default: 4.5, 1-5)",
  "ratingsQuantity": "Number (default: 0)",
  "price": "Number (required)",
  "priceDiscount": "Number (optional, must be < price)",
  "summary": "String",
  "description": "String (required)",
  "imageCover": "String (required)",
  "images": ["String"],
  "startDates": ["Date"],
  "secretTour": "Boolean (default: false)",
  "startLocation": {
    "type": "Point",
    "coordinates": [Number, Number],
    "address": "String",
    "description": "String"
  },
  "locations": [{
    "type": "Point",
    "coordinates": [Number, Number],
    "address": "String",
    "description": "String",
    "day": "Number"
  }],
  "guides": ["ObjectId (ref: User)"]
}
```

#### User

```json
{
  "name": "String (required)",
  "email": "String (required, unique, valid email)",
  "role": "String (enum: 'user', 'guide', 'lead-guide', 'admin', default: 'user')",
  "photo": "String (default: 'default.jpg')",
  "password": "String (required, min 8 chars, not selected)",
  "passwordConfirm": "String (required, min 8 chars, validated to match password)",
  "passwordChangedAt": "Date",
  "active": "Boolean (default: true, not selected)"
}
```

#### Review

```json
{
  "review": "String (required)",
  "rating": "Number (1-5, required)",
  "createdAt": "Date (default: now)",
  "tour": "ObjectId (ref: Tour, required)",
  "user": "ObjectId (ref: User, required)"
}
```

#### Booking

```json
{
  "tour": "ObjectId (ref: Tour, required)",
  "user": "ObjectId (ref: User, required)",
  "price": "Number (required)",
  "createdAt": "Date (default: now)",
  "paid": "Boolean (default: true)"
}
```

### API Endpoints

#### Tours

**GET /api/v1/tours/top-5-cheap**

- Get top 5 cheapest tours
- Response: Array of Tour objects

**GET /api/v1/tours/tour-stats**

- Get tour statistics (aggregated data)
- Auth: Required
- Response: Statistics object

**GET /api/v1/tours/monthly-plan/:year**

- Get monthly plan for a specific year
- Auth: Required (admin/lead-guide/guide)
- Response: Monthly plan data

**GET /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit**

- Get tours within a distance from a point
- Params: distance (number), latlng (lat,lng), unit (mi/km)
- Example: `/tours-within/200/center/34.111,-118.113/unit/mi`
- Response: Array of Tour objects

**GET /api/v1/tours/distances/:latlng/unit/:unit**

- Get distances from a point to all tours
- Params: latlng (lat,lng), unit (mi/km)
- Response: Array of distance objects

**GET /api/v1/tours**

- Get all tours
- Query params: filtering, sorting, pagination, field limiting
- Response: `{ status: 'success', results: number, data: { data: [Tour] } }`

**POST /api/v1/tours**

- Create a new tour
- Auth: Required (admin/lead-guide)
- Body: Tour object (without id, timestamps)
- Response: Created Tour object

**GET /api/v1/tours/:id**

- Get a specific tour by ID
- Response: Tour object with populated guides and virtual reviews

**PATCH /api/v1/tours/:id**

- Update a tour
- Auth: Required (admin/lead-guide)
- Body: Partial Tour object
- Response: Updated Tour object

**DELETE /api/v1/tours/:id**

- Delete a tour
- Auth: Required (admin/lead-guide)
- Response: 204 No Content

#### Users

**POST /api/v1/users/signup**

- User registration
- Body: `{ name, email, password, passwordConfirm }`
- Response: User object with JWT token

**POST /api/v1/users/login**

- User login
- Body: `{ email, password }`
- Response: User object with JWT token

**GET /api/v1/users/logout**

- User logout (clears cookie)
- Response: Success message

**POST /api/v1/users/forgotPassword**

- Request password reset
- Body: `{ email }`
- Response: Success message (email sent)

**PATCH /api/v1/users/resetPassword/:token**

- Reset password with token
- Body: `{ password, passwordConfirm }`
- Response: User object with new JWT token

**PATCH /api/v1/users/update-password**

- Update current user's password
- Auth: Required
- Body: `{ passwordCurrent, password, passwordConfirm }`
- Response: User object with new JWT token

**PATCH /api/v1/users/update-me**

- Update current user's profile
- Auth: Required
- Body: Partial User object (name, email, photo)
- Response: Updated User object

**DELETE /api/v1/users/delete-me**

- Deactivate current user's account
- Auth: Required
- Response: Success message

**GET /api/v1/users/me**

- Get current user's profile
- Auth: Required
- Response: User object

**GET /api/v1/users**

- Get all users
- Auth: Required (admin/super-admin)
- Query params: filtering, sorting, pagination, field limiting
- Response: Array of User objects

**POST /api/v1/users**

- Create a new user
- Auth: Required (admin/super-admin)
- Body: User object
- Response: Created User object

**GET /api/v1/users/:id**

- Get a specific user
- Auth: Required (admin/super-admin)
- Response: User object

**PATCH /api/v1/users/:id**

- Update a user
- Auth: Required (admin/super-admin)
- Body: Partial User object
- Response: Updated User object

**DELETE /api/v1/users/:id**

- Delete a user
- Auth: Required (admin/super-admin)
- Response: 204 No Content

#### Reviews

**GET /api/v1/reviews**

- Get all reviews (or reviews for a specific tour if nested)
- Auth: Required
- Query params: filtering, sorting, pagination, field limiting
- Response: Array of Review objects with populated user

**POST /api/v1/reviews**

- Create a new review
- Auth: Required (user role)
- Body: `{ review, rating, tour, user }` (tour and user auto-set if nested)
- Response: Created Review object

**GET /api/v1/reviews/:id**

- Get a specific review
- Response: Review object with populated user

**PATCH /api/v1/reviews/:id**

- Update a review (only by review author)
- Body: Partial Review object
- Response: Updated Review object

**DELETE /api/v1/reviews/:id**

- Delete a review
- Auth: Required (admin)
- Response: 204 No Content

#### Bookings

**GET /api/v1/bookings/checkout-session/:tourId**

- Get Stripe checkout session for a tour
- Auth: Required
- Response: Stripe session object

**GET /api/v1/bookings**

- Get all bookings
- Auth: Required (lead-guide/admin)
- Query params: filtering, sorting, pagination, field limiting
- Response: Array of Booking objects with populated user and tour

**POST /api/v1/bookings**

- Create a new booking
- Auth: Required (lead-guide/admin)
- Body: Booking object
- Response: Created Booking object

**GET /api/v1/bookings/:id**

- Get a specific booking
- Auth: Required (lead-guide/admin)
- Response: Booking object with populated user and tour

**PATCH /api/v1/bookings/:id**

- Update a booking
- Auth: Required (lead-guide/admin)
- Body: Partial Booking object
- Response: Updated Booking object

**DELETE /api/v1/bookings/:id**

- Delete a booking
- Auth: Required (lead-guide/admin)
- Response: 204 No Content

## Usage

- Access the application at `http://localhost:8000`
- API endpoints are available under `/api/v1/`
- Use tools like Postman to test API endpoints

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- Pug (for templating)
- Stripe (for payments)
- JWT (for authentication)
- Multer (for file uploads)
- Sharp (for image processing)
- Nodemailer (for emails)
