import fs from "node:fs/promises";

const portfolioFile = new URL("../data/portfolio.json", import.meta.url);

export const getPortfolioData = async () => {
  const content = await fs.readFile(portfolioFile, "utf8");
  return JSON.parse(content);
};
