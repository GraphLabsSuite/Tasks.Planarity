import * as React from 'react';
import { store, TaskTemplate, TaskToolbar, ToolButtonList } from 'graphlabs.core.template';

class App extends TaskTemplate {

    getTaskToolbar() {
        TaskToolbar.prototype.getButtonList = () => {
            ToolButtonList.prototype.help = () => `В данном задании будет выполняться проверка 
            планарности графа.`;
            return ToolButtonList;
        };
        return TaskToolbar;
    }
}

export default App;
