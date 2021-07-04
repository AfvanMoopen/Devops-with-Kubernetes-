const TodoList = ({ todos }) => {
  return (
    <ul>
      { todos.map((todo) => <li key={todo.id}>{todo.content}</li>)}
    </ul>
  )
};

export default TodoList;