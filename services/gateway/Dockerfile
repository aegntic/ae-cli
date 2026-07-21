# Pre-built deploy with dereferenced node_modules.
# pnpm uses a symlink-based virtual store that Docker can't COPY reliably.
# We dereference with tar locally (in .dockerignore'd staging) before build.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY dist ./dist
COPY node_modules-real ./node_modules
COPY package.json ./
COPY migrations ./migrations
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.js"]