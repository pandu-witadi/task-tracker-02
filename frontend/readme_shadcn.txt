# create project  
npm create vite@latest  

# Add Tailwind CSS  
npm install tailwindcss @tailwindcss/vite


# Replace everything in src/index.css with the following:
@import "tailwindcss";

# Edit tsconfig.json file
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}


# Edit tsconfig.app.json file
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
    // ...
  }
}

# Update vite.config.ts
npm install -D @types/node


vite.config.ts  
--------------  
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

# Run the CLI
npx shadcn@latest init

# You will be asked a few questions to configure components.json.
Which color would you like to use as base color? › Neutral

# Add Components, ex: button
npx shadcn@latest add button
