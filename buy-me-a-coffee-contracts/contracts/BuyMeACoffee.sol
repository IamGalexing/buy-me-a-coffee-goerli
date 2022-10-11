// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract BuyMeACoffee {
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    Memo[] private memos;

    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can withdraw tips");
        _;
    }

    function buyCoffee(string memory _name, string memory _message)
        public
        payable
    {
        require(msg.value > 0, "Can't buy coffee with 0 ETH");
        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    function withdrawTips() public onlyOwner {
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent, "Withdraw failed");
    }

    function changeOwner(address newOwnerAddress) public onlyOwner {
        require(
            newOwnerAddress != msg.sender,
            "New owner address is a current owner"
        );
        owner = payable(newOwnerAddress);
    }

    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    receive() external payable {}

    fallback() external payable {}
}
