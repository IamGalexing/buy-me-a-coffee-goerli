const { ethers } = require("hardhat");

async function main() {
  const [owner, tipper1, tipper2, tipper3] = await ethers.getSigners();

  const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.deployed();
  console.log(`BuyMeACoffee deployed to:`, buyMeACoffee.address);

  const addresses = [owner.address, tipper1.address, buyMeACoffee.address];

  console.log("--------start--------");
  printBalances(addresses);

  //buy the owner some coffee
  const tip = { value: ethers.utils.parseEther("1") };
  await buyMeACoffee
    .connect(tipper1)
    .buyCoffee("John", "Buy the good one :)", tip);
  await buyMeACoffee
    .connect(tipper2)
    .buyCoffee(
      "Emily",
      "You will have money to pay for your own coffee next time",
      tip
    );
  await buyMeACoffee.connect(tipper3).buyCoffee("Queen", "Be a nice boy", tip);

  console.log("--------after tips--------");
  printBalances(addresses);

  // owner withdraw tips to buy coffee
  await buyMeACoffee.connect(owner).withdrawTips();
  console.log("--------after withdraw--------");
  printBalances(addresses);

  //check out all memos left for the owner
  const memos = await buyMeACoffee.getMemos();
  console.log("--------all memos--------");
  printMemos(memos);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function getBalance(address) {
  const balanceBigInt = await ethers.provider.getBalance(address);
  return ethers.utils.formatEther(balanceBigInt);
}

function printBalances(addresses) {
  addresses?.forEach(async (address, index) => {
    console.log(`Balance of the address ${index}`, await getBalance(address));
  });
}

function printMemos(memos) {
  memos?.forEach(({ from, timestamp, name, message }) => {
    console.log(`
    Name: ${name}, 
    Message: ${message},
    Address: ${from}, 
    Timestamp: ${timestamp}`);
  });
}
