# Image Upload Setup (Cloudinary)

1. Create Cloudinary account.
2. Copy `CLOUDINARY_URL` and set env var.
3. Use admin-only endpoint:
- `POST /api/upload`
- body: `{ "file": "<base64-or-remote-url>", "folder": "furni/products" }`
4. Endpoint signs uploads server-side and returns:
- `publicId`
- `secureUrl`
5. Save `secureUrl` to `Product.imageUrl` via product CRUD API.
