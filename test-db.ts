import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const content = await prisma.homePageContent.findUnique({ where: { id: "global" } });
  console.log("Hero Image field:", content?.heroBackgroundImage);
}
main();
