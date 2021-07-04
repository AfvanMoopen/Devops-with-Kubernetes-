import { useEffect, useState } from 'react';
import Styled from 'styled-components';
import Axios from 'axios';

import TodoList from './components/TodoList';

const AppContainer = Styled.div`
  margin-top: 10px;
  text-align: center;
`;

const HeaderImage = Styled.img`
  max-width: 300px;
  margin-bottom: 10px;
`;

function App() {
  const [ todoList, setTodoList ] = useState([]);
  const [ todoText, setTodoText ] = useState('');

  const fetchTodos = async () => {
    const { data } = await Axios('/api/todos');
    setTodoList(data);
  };

  useEffect( () => {
    fetchTodos();
  }, []);

  const storeTodo = async (e) => {
    e.preventDefault();
    await Axios.post('/api/todos', {
      todo: todoText
    });
    await fetchTodos();
  };

  return (
    <AppContainer>
        <HeaderImage src="/api/dailypicture" alt=""/>
        <div>
          <div>
            <input
              type="text" maxLength="140"
              value={todoText}
              onChange={(e) => setTodoText(e.target.value) }/>
            <button onClick={storeTodo}>Create TODO</button>
          </div>
          <TodoList todos={todoList}/>
        </div>
    </AppContainer>
  );
}

export default App;
