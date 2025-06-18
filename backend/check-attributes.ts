import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAttributes() {
  const productWithAttributes = await prisma.product.findFirst({
    where: {
      slug: 'mobil-1-esp-5w-30'
    },
    include: {
      attributes: {
        include: {
          attribute: {
            include: {
              options: true
            }
          }
        }
      }
    }
  });

  console.log('Product:', productWithAttributes?.name);
  console.log('Attributes count:', productWithAttributes?.attributes?.length || 0);
  
  if (productWithAttributes?.attributes) {
    productWithAttributes.attributes.forEach(attr => {
      console.log(`- ${attr.attribute.name}:`, {
        textValue: attr.textValue,
        numberValue: attr.numberValue,
        colorValue: attr.colorValue,
        optionIds: attr.optionIds
      });
    });
  }
}

checkAttributes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());