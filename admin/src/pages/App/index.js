/**
 *
 * Top-level definitions of all admin pages in the plugin.
 * All pages must be defined here.
 *
 */

import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { AnErrorOccurred } from '@strapi/helper-plugin'
import pluginId from '../../pluginId'

import Homepage from '../Home'
import Indexes from '../Indexes'
import Index from '../Index'
import IndexMappings from '../IndexMappings'
import IndexMapping from '../IndexMapping'
import Mappings from '../Mappings'
import Mapping from '../Mapping'
import ConfigureCollectionList from '../ConfigureCollectionList'
import ConfigureCollection from '../ConfigureCollection'
import ViewIndexingRunLog from '../ViewIndexingRunLog'
import Tools from '../Tools'

const App = () => {
    return (
        <Switch>

            <Route path={`/plugins/${pluginId}`} render={() => (<Redirect to={`/plugins/${pluginId}/home`} />)} exact />
            <Route path={`/plugins/${pluginId}/home`} component={Homepage} exact />

            <Route path={`/plugins/${pluginId}/indexes`} component={Indexes} exact />
            <Route path={`/plugins/${pluginId}/indexes/:indexId`} component={Index} exact />
            <Route path={`/plugins/${pluginId}/indexes/:indexId/mappings`} component={IndexMappings} exact />
            <Route path={`/plugins/${pluginId}/indexes/:indexId/mappings/:mappingId`} component={IndexMapping} exact />

            <Route path={`/plugins/${pluginId}/mappings`} component={Mappings} exact />
            <Route path={`/plugins/${pluginId}/mappings/:mappingId`} component={Mapping} exact />

            <Route path={`/plugins/${pluginId}/tools`} component={Tools} />

            <Route path={`/plugins/${pluginId}/configure-collections`} component={ConfigureCollectionList} exact />
            <Route path={`/plugins/${pluginId}/configure-collections/:collectionName`} component={ConfigureCollection} exact />
            <Route path={`/plugins/${pluginId}/view-indexing-logs`} component={ViewIndexingRunLog} />

            <Route component={AnErrorOccurred} />
        </Switch>
    )
}

export default App
