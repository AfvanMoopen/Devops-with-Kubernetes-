const TodoList = ({ todos }) => {
  return (
    <ul>
      { todos.map((todo) => <li key={todo.id}>{todo.text}</li>)}
    </ul>
  )
};

export default TodoList;