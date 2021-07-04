import Styled from 'styled-components';

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
  return (
    <AppContainer>
        <HeaderImage src="/api/dailypicture" alt=""/>
        <div>
          <div>
            <input type="text" maxLength="140"/>
            <button>Create TODO</button>
          </div>
          <TodoList/>
        </div>
    </AppContainer>
  );
}

export default App;
