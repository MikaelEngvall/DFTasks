# DFTasks - Fastighetsförvaltningssystem

## Översikt

DFTasks är ett modernt fastighetsförvaltningssystem utvecklat för Duggals Fastigheter. Systemet hanterar felanmälningar, uppgiftshantering och kommunikation mellan fastighetsförvaltare och användare.

## Teknisk Stack

### Frontend

- **React** (v18.2.0) - Huvudramverk
- **Tailwind CSS** - Styling och UI-komponenter
- **i18next** - Flerspråksstöd (Svenska, Engelska, Polska, Ukrainska)
- **React Router** - Klientsidig routing
- **Axios** - HTTP-klient
- **JWT** - Autentisering
- **React Icons** - Ikonbibliotek
- **React Hot Toast** - Notifikationer

### Backend

- **Node.js/Express** - Server och API
- **MongoDB/Mongoose** - Databas och ORM
- **JWT** - Autentisering och auktorisering
- **bcryptjs** - Lösenordskryptering
- **nodemailer** - E-posthantering
- **Google Translate API** - Automatisk översättning

## Arkitektur

### Frontend-struktur

```
frontend/
├── public/          # Statiska filer
├── src/
│   ├── components/  # React-komponenter
│   ├── context/     # React Context (Auth, Theme)
│   ├── hooks/       # Custom hooks
│   ├── i18n/        # Översättningsfiler
│   ├── services/    # API-tjänster
│   └── utils/       # Hjälpfunktioner
```

### Backend-struktur

```
backend/
├── controllers/     # Route-hanterare
├── middleware/      # Middleware (auth, etc.)
├── models/         # Mongoose-modeller
├── routes/         # API-routes
└── utils/          # Hjälpfunktioner
```

## Huvudfunktioner

### Autentisering och Auktorisering

- JWT-baserad autentisering
- Rollbaserad åtkomstkontroll (USER, ADMIN, SUPERADMIN)
- Automatisk utloggning vid inaktivitet
- Lösenordsåterställning via e-post

### Uppgiftshantering

- CRUD-operationer för uppgifter
- Statushantering (Väntande, Pågående, Slutförd, Kan ej åtgärda)
- Kommentarssystem med arkiveringsfunktion
- Automatisk e-postnotifiering
- Stöd för bilagor

### Användarhantering

- Användaradministration för administratörer
- Profilinställningar
- Språkpreferenser
- Aktivering/inaktivering av användare

### Flerspråksstöd

- Fullständigt stöd för fyra språk
- Automatisk översättning av dynamiskt innehåll
- Språkval sparas per användare

### UI/UX

- Responsiv design
- Mörkt/ljust tema
- Realtidsuppdateringar
- Tillgänglighetsanpassad
- Toast-notifikationer

## Datamodeller

### Task (Uppgift)

```javascript
{
  title: String,
  description: String,
  status: Enum['pending', 'in progress', 'completed', 'cannot fix'],
  assignedTo: ObjectId,
  dueDate: Date,
  comments: [{
    content: String,
    createdBy: ObjectId,
    isActive: Boolean
  }],
  isActive: Boolean,
  translations: {
    sv: { title, description },
    en: { title, description },
    pl: { title, description },
    uk: { title, description }
  }
}
```

### User (Användare)

```javascript
{
  name: String,
  email: String,
  password: String,
  role: Enum['USER', 'ADMIN', 'SUPERADMIN'],
  isActive: Boolean,
  preferredLanguage: String,
  lastLogin: Date
}
```

## API-struktur

### Autentisering

- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Uppgifter

- GET /api/tasks
- POST /api/tasks
- GET /api/tasks/:id
- PATCH /api/tasks/:id
- DELETE /api/tasks/:id
- POST /api/tasks/:id/comments
- PATCH /api/tasks/:id/status

### Användare

- GET /api/users
- POST /api/users
- PATCH /api/users/:id
- PATCH /api/users/:id/toggle-status

### Profil

- GET /api/profile
- PATCH /api/profile
- PATCH /api/profile/change-password

## Säkerhet

- Krypterade lösenord med bcrypt
- JWT-tokens med begränsad livstid
- CORS-konfiguration
- Rate limiting
- Input-validering
- XSS-skydd via React
- Miljövariabler för känslig data

## Utvecklingsmiljö

- Bun som pakethanterare och runtime
- Hot-reloading för utveckling
- ESLint för kodkvalitet
- Prettier för kodformatering
- Git för versionshantering

## Installation och Körning

### Förutsättningar

- Node.js 18+ eller Bun
- MongoDB
- Google Translate API-nyckel

### Installation

```bash
# Frontend
cd frontend
bun install
bun start

# Backend
cd backend
bun install
bun run dev
```

### Miljövariabler

```env
# Backend
PORT=5000
MONGODB_URL=mongodb://localhost/dftasks
ACCESS_TOKEN_SECRET=your_secret
GOOGLE_TRANSLATE_API_KEY=your_key

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```
