
# Ceylon Trails - The Travel Companion 

A travel companion platform built with the MERN stack where users can document, share, and discover travel experiences across Sri Lanka and beyond.

## Contributors / Team Members

- **[Thimeth Sathmika](URL)** 
- **[Hiruvinda ](URL)** 
- **[Dishan](URL)** 
- **[Ravindu Thiranjaya](URL)** 


## Key Features

- **User Management** - Registration, login, profile management, admin controls
- **Post Management** - Create, edit, delete travel posts with location tagging
- **Content Discovery** - Browse, search, filter posts with interactive maps
- **Engagement Features** - Comments, voting, save posts, content reporting

## Tech Stack & Libraries

### Frontend
- **[React.js](https://reactjs.org/)** – Fast, component-based UI   
- **[Tailwind CSS](https://tailwindcss.com/)** – Styling UI components  
- **[React Router DOM](https://reactrouter.com/)** – Client-side routing  
- **[Framer Motion](https://www.framer.com/motion/)** – Animation library
- **[Leaflet](https://leafletjs.com/)** & **[React Leaflet](https://react-leaflet.js.org/)** – Interactive maps
- **[Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/)** – Map routing
- **[Axios](https://axios-http.com/)** – HTTP client for API requests
- **[React Player](https://www.npmjs.com/package/react-player)** – Media player component
- **[Lucide React](https://lucide.dev/)** – Icon library
- **[Vite](https://vitejs.dev/)** – Build tool and dev server  


### Backend
- **[Node.js](https://nodejs.org/)** & **[Express.js](https://expressjs.com/)** – Server-side logic  
- **[MongoDB](https://www.mongodb.com/)** & **[Mongoose](https://mongoosejs.com/)** – Database and ODM  
- **[JWT](https://www.npmjs.com/package/jsonwebtoken)** – Authentication tokens
- **[Bcrypt](https://www.npmjs.com/package/bcrypt)** – Password hashing
- **[Cloudinary](https://cloudinary.com/)** – Image storage and management
- **[Multer](https://www.npmjs.com/package/multer)** – File upload handling
- **[Nodemailer](https://nodemailer.com/)** – Email sending
- **[OpenAI](https://www.npmjs.com/package/openai)** – AI integration
- **[CORS](https://www.npmjs.com/package/cors), [Cookie-Parser](https://www.npmjs.com/package/cookie-parser), [Dotenv](https://www.npmjs.com/package/dotenv)** – Backend utilities
- **[Nodemon](https://www.npmjs.com/package/nodemon) (dev)** – Auto-restart server during development


## Setting Up Development Environment 

1. Clone the repository

```bash
  git clone https://github.com/Y3S1Group/ceylon_trails.git
  cd ceylon_trails
```
2. Fetch All Remote Branches

```bash
  # Fetch all remote branches
  git fetch --all
  
  # See all available branches
  git branch -a
```
3. Checkout to Branch

```bash
  git checkout <<branch name>>
```
4. Frontend Setup & Run

```bash
  cd client
  npm run dev
```

5. Backend Setup & Run

```bash
  cd server
  npm run server
```






