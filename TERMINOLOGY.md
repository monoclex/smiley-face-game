# Terminology

To ensure code consistency, specific parts of the code may refer some things as some other things. This document ensures consistency
amongst the codebase by having a single distinct term for each distinct idea that must be represented.

## Terms

- `User` refers to the human being playing the game.
- `Account` refers to the information stored in the database about a given User. There is typically a 1 to 1 relationship between a User and their Account, but it is common to find a 1 to many relationship between a User and their Accounts. For the purpose of simplicity, a 1 to 1 relationship between a User and their Account is assumed.
- `Player` refers to an active character in a given world whose capabilities are described by an account; for example, which blocks it can place is a capability. There is typically 1 to 1 replationship between an Account and the Player, but it is common to find a 1 to many relationship between an Account and the Players.
- `Character` refers to the sprite that moves around the world, representing an Account.
- `Level` refers to the concept of the 2d box of which blocks can be placed or removed, and Characters are capable of interacting within.
- `World` refers to the information stored in the database about a given Level.
- `Room` refers to a Level which can be joined by others, and whose state is typically dervied from a World. A Room upon being saved may replace the data that a World use to refer to. In Layman's terms, it's the active in-game representation of a World.
