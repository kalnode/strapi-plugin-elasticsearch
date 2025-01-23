import React, { useState, useEffect } from 'react'
// import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import  { SubNavigation } from '../../components/SubNavigation'
import { Box, Flex, Button } from '@strapi/design-system'
import axiosInstance  from '../../utils/axiosInstance'
import { Typography } from '@strapi/design-system'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'

const PageIndexes = () => {

    const [isInProgress, setIsInProgress] = useState(false)
    const toggleNotification = useNotification()

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />

            <Flex direction="column" alignItems="start" gap={8} padding={8} background="neutral100" width="100%">
                <Box>
                    <Typography variant="alpha">Indexes</Typography>
                </Box>

                <Flex direction="column" alignItems="start" gap={8} width="100%">
                    <Box style={{ alignSelf: 'stretch' }} background="neutral0" padding="32px" hasRadius={true}>
                        <Flex direction="column" alignItems="start" gap={8}>

                            <Typography variant="beta">Future home of indexes</Typography>

                            This section will entail:

                            <ul>
                                <li>Table showing indexes with batch controls</li>
                                <li>Clicking an index will open child page</li>
                                <li>
                                    Index child page will have:
                                    <ul>
                                        <li>Details</li>
                                        <li>Mappings</li>
                                        <li>Actions</li>
                                    </ul>
                                </li>
                            </ul>
                        </Flex>
                    </Box>
                </Flex>

            </Flex>

        </Flex>
    )

}

export default PageIndexes
