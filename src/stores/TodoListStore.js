/************************************************

  Name: /src/TodoListStore.js

  Description: This is the primary mobx store for our app which instantiates
  and manages the todo tree.

  TODO:


  Copyright (c) 2017-present Justin Haaheim

  This file is subject to the terms and conditions defined in
  file 'LICENSE', which is part of this source code package.

********************************************** */

import { observable, computed, action, autorun, toJS } from 'mobx';

import TodoNode from './TodoNode';

export class TodoListStore {

  // can be SHOW_ALL, SHOW_ACTIVE or SHOW_COMPLETED
  @observable visibilityFilter = 'SHOW_ALL';
  @observable demoMode = true;
  @observable todoRoot;

  // returns a 'flattened' array of the todo tree.
  @computed get todos() {
    // recursive function to flatten children
    var flattenChildren = (startNode) => {

      var result = [];

      if (!startNode.isRoot) {
        result.push(startNode);
      }
      for (let n of startNode.children) {
        result = result.concat(flattenChildren(n));
      }
      return result;
    }
    // flattenChildren = action(flattenChildren);
    return flattenChildren(this.todoRoot);
  }

  @computed get filteredTodos() {
    switch (this.visibilityFilter) {
      case 'SHOW_ALL':
        return this.todos;
      case 'SHOW_ACTIVE':
        return this.todos.filter( t => {
          return t.completed === false;
        })
      case 'SHOW_COMPLETED':
        return this.todos.filter( t => {
          return t.completed === true;
      })
      default:
        throw new Error('Invalid filter.');
    }
  }

  @action.bound
  findNodeById(id, startNode = this.todoRoot) {
    for (let n of startNode.children) {
      if (n.id === id) {
        return n;
      }
      // Recurse down into n's children
      let result = this.findNodeById(id, n);
      if (result) {  // if result is not undefined
        return result;
      }
    }
    // if nothing was found, return undefined
    return undefined;
  }

  // Eliminates need for error checking in users of this method
  @action.bound
  findNodeByIdSafe(id) {
    const node = this.findNodeById(id);
    if ('undefined' === typeof node) {
      throw new Error(`No TodoNode with id ${id}`);
    }
    return node;
  }

  // May just use this for debugging.
  @action.bound
  addTodo(text = '') {
    const newNode = new TodoNode(this.todoRoot, text);
    this.todoRoot.children.push(newNode);
    return newNode;
  }

  // @action.bound
  // addTodoAfterId(id = undefined, text = '') {
  //   console.log('addTodoAfter: id = ', id);
  //   console.log('addTodoAfter: typeof id = ', typeof id);
  //   if ('undefined' === typeof id) {
  //     // If no id is provided push a new Todo onto the base level list.
  //     this.todoRoot.children.push(new TodoNode(this.todoRoot, text));
  //     return;
  //   }
  //
  //   const node = this.findNodeByIdSafe(id);
  //   // insert add a new TodoNode in the parent's children array after the index
  //   // of node
  //   node.parent
  //       .children
  //       .splice(node.index + 1,
  //               0,
  //               new TodoNode(node.parent, text));
  // }

  @action.bound
  addTodoAfter(node, text='') {
    node.parent.children.splice(node.index + 1,
                                0, // insert, rather than overwrite
                                new TodoNode(node.parent, text));
  }

  @action.bound
  deleteTodo(id) {
    // this could also be accomplished by
    // node.parent.children.splice(node.index, 1)
    // though .splice has been funky in other instances with mobx
    const node = this.findNodeByIdSafe(id);
    node.parent.children.remove(node);
  }

  constructor() {
    this.todoRoot = new TodoNode(); // parent is undefined

    // For debugging, populate with a few sample tasks.
    this.addTodo('Todo number 1!');
    this.addTodo('Todo number 2!');
    this.addTodo('Todo number 3!');

    // autorun(() => console.log('todoRoot: ', this.todoRoot ));

    // this.addTodo.bind(this);
    // this.addTodoAfter.bind(this);
    // this.deleteTodo.bind(this);

    // For debugging:

    // autorun(() => console.log('Flattened TodoList = ',
    //                           this.todos.map( (t, i) => t.text )));

  }

}

export default new TodoListStore();
