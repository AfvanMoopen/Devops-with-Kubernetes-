const TodoList = ({ changeDoneState, todos }) => {
  return (
    <div>
    { todos.map((todo) => <div key={todo.id}>
        <span
          style={{ fontWeight: 'bold', fontSize: '20pt', verticalAlign: 'sub', cursor: 'pointer' }}
          onClick={() => changeDoneState(todo.id)}>
          {todo.done ? '☑' : '☐'}
        </span>
        {todo.content}
      </div>)}
    </div>
  )
};

export default TodoList;