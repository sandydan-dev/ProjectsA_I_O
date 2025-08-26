module.exports.UserModel = require("./Registraion/user.model");
module.exports.TaskModel = require("./TodoList/task.model");
module.exports.ContactManagerModel = require("./ContactManager/contactmanager.model");

// todo: Library Management System
//* Library Branch Model : 1
module.exports.LibraryBranchModel = require("./LibraryManagement/LibraryBranch/libraryBranch.model");

//* User as librarian : 2
module.exports.LibrarianModel = require("./LibraryManagement/Librarian/librarian.model");

//* books category : 3
module.exports.CategoryModel = require("./LibraryManagement/BookCategory/bookCategory.model");

//* book shelf : 4
module.exports.ShelfModel = require("./LibraryManagement/ShelfModel/shelf.model");

//* book details
module.exports.BookModel = require("./LibraryManagement/Book/book.model");

//* Book inventory
module.exports.BookInventoryModel = require("./LibraryManagement/BookInventory/bookInventory.model");
