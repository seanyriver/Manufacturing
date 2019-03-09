import * as React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './components/Home';
import MaterialListView from './components/MaterialListView';
import { ModalContainer } from 'react-router-modal';
import MaterialView from './components/MaterialView';
import { Switch } from 'react-router';

export const routes = <Layout>
    <Switch>
        <Route exact path='/' component={ Home } />
        <Route path='/materials/:id/:section' component={ MaterialView } />
        <Route path='/materials/:id' component={ MaterialView } />
        <Route path='/materials' exact component={ MaterialListView } />
    </Switch>
    <ModalContainer />
</Layout>;

