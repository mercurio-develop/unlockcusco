const fs = require('fs');

function updateEnv() {
  const envLocal = fs.readFileSync('.env.local', 'utf-8');
  const env = fs.readFileSync('.env', 'utf-8');

  // Extract POSTGRES_PRISMA_URL from .env.local
  const supabaseUrlMatch = envLocal.match(/^POSTGRES_PRISMA_URL=(.*)$/m);
  if (!supabaseUrlMatch) {
    console.error("Could not find POSTGRES_PRISMA_URL in .env.local");
    return;
  }
  const supabaseUrl = supabaseUrlMatch[1].trim();

  // Update .env
  let newEnv = env;
  if (newEnv.match(/^DATABASE_URL=.*$/m)) {
    newEnv = newEnv.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${supabaseUrl}`);
  } else {
    newEnv += `\nDATABASE_URL=${supabaseUrl}`;
  }

  if (newEnv.match(/^POSTGRES_PRISMA_URL=.*$/m)) {
    newEnv = newEnv.replace(/^POSTGRES_PRISMA_URL=.*$/m, `POSTGRES_PRISMA_URL=${supabaseUrl}`);
  } else {
    newEnv += `\nPOSTGRES_PRISMA_URL=${supabaseUrl}`;
  }

  // Update .env.local
  let newEnvLocal = envLocal;
  if (newEnvLocal.match(/^DATABASE_URL=.*$/m)) {
    newEnvLocal = newEnvLocal.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${supabaseUrl}`);
  } else {
    newEnvLocal += `\nDATABASE_URL=${supabaseUrl}`;
  }

  fs.writeFileSync('.env', newEnv);
  fs.writeFileSync('.env.local', newEnvLocal);
  
  console.log("Successfully updated .env and .env.local to point to Supabase.");
}

updateEnv();