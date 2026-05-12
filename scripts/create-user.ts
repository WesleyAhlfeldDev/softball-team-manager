import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const EMAIL    = "wesley@wesleyahlfeld.me";
const PASSWORD = "changeme123";
const NAME     = "Wesley";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  if (existing) {
    await prisma.user.update({
      where: { email: EMAIL },
      data: { passwordHash, name: NAME },
    });
    console.log(`✅ Updated password for ${EMAIL}`);
  } else {
    await prisma.user.create({
      data: { email: EMAIL, passwordHash, name: NAME },
    });
    console.log(`✅ Created user ${EMAIL}`);
  }

  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log(`\n⚠️  Change your password after first login.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
