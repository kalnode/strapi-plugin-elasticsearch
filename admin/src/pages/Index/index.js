import React, { useState, useEffect } from 'react'
import { SubNavigation } from '../../components/SubNavigation'
import { Index } from '../../components/Index'
import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TextInput, IconButton, CaretDown } from '@strapi/design-system'
import { apiGetIndex } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { Typography } from '@strapi/design-system'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { useParams } from 'react-router-dom'

const PageIndex = () => {

    const [isInProgress, setIsInProgress] = useState(false)
    const [indexId, setIndexId] = useState(null)
    const params = useParams()
    const showNotification = useNotification()
    
    useEffect( () => {
        if (params && params.indexId) {
            setIndexId(params.indexId)
        }
    }, [params])

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />
            <Flex direction="column" alignItems="start" gap={8} padding={8} background="neutral100" width="100%">
                <Box width="100%">
                    Index: { indexId }
                    { indexId && (
                        <Index indexId={indexId} />
                    )}
                </Box>
            </Flex>
        </Flex>
    )
}

export default PageIndex