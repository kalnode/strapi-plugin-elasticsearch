import React, { useState, useEffect } from 'react'
// import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { SubNavigation } from '../../components/SubNavigation'
import { Mappings } from '../../components/Mappings'
import '../../styles/styles.css'
import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TextInput, IconButton, CaretDown } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus } from '@strapi/icons'

import axiosInstance  from '../../utils/axiosInstance'
import { Typography } from '@strapi/design-system'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'

import { apiGetMappings, apiCreateMapping, apiDeleteMapping, apiGetContentTypes } from '../../utils/apiUrls'
import { useHistory } from "react-router-dom"

const PageMappings = () => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    // const [mappings, setMappings] = useState(null)
    // const history = useHistory()
    // const showNotification = useNotification()

    // useEffect(() => {
    //     requestGetMappings()
    // }, [])

    // const requestGetMappings = () => {
    //     setIsInProgress(true)
    //     axiosInstance.get(apiGetMappings)
    //         .then((response) => {
    //             if (response.data && Array.isArray(response.data) && response.data.length > 0) {
    //                 setMappings(response.data)
    //             } else {
    //                 setMappings(null)
    //             }
    //         })
    //         .catch((error) => {
    //             console.log("PAGE MAPPINGS - requestGetMappings ERROR: ", error)
    //             showNotification({
    //                 type: "warning", message: "An error has encountered: " + error, timeout: 5000
    //             })
    //         })
    //         .finally(() => {
    //             setIsInProgress(false)
    //         })
    // }

    // // ===============================
    // // CREATE NEW MAPPING
    // // ===============================
    // const [showCreateModal, setShowCreateModal] = useState(false)
    // const [selectedType, setSelectedType] = useState(null)
    // const [contentTypes, setContentTypes] = useState(null)

    // const getContentTypes = () => {
    //     setIsInProgress(true)
    //     return axiosInstance.get(apiGetContentTypes)
    //         .then((response) => {
    //             setContentTypes(response.data)
    //         })
    //         .catch((error) => {
    //             console.log("PAGE MAPPINGS - getContentTypes ERROR: ", error)
    //             showNotification({
    //                 type: "warning", message: "An error has encountered: " + error, timeout: 5000
    //             })
    //         })
    //         .finally(() => {
    //             setIsInProgress(false)
    //         })
    // }

    // const modalCreateMappingOpen = async () => {
    //     setSelectedType(null)
    //     await getContentTypes()
    //     setShowCreateModal(true)
    // }

    // const modalCreateMappingClose = async (reload) => {
    //     setSelectedType(null)
    //     setShowCreateModal(false)
    //     console.log("modalCreateMappingClose 112233 ", reload)
    //     if (reload) {
    //         requestGetMappings()
    //     }
    // }


    // const requestDeleteMapping = (e, mappingIDNumber) => {
    //     e.stopPropagation()
    //     setIsInProgress(true)
    //     return axiosInstance.get(apiDeleteMapping(mappingIDNumber))
    //     .then((response) => {
    //         console.log("Delete response is: ", response)
    //     })
    //     .catch((error) => {
    //         console.log("PAGE MAPPINGS - requestDeleteMapping ERROR: ", error)
    //         showNotification({
    //             type: "warning", message: "An error has encountered: " + error, timeout: 5000
    //         })
    //     })
    //     .finally(() => {
    //         requestGetMappings()
    //     })
    // }


    return (
        <Flex alignItems="stretch" gap={4} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', width: '100%', overflow: 'hidden' }}>
            <SubNavigation />

            <Flex direction="column" alignItems="start" gap={2} padding={8} background="neutral100" width="100%" style={{ width: '100%', overflow: 'hidden' }}>
                <Mappings />
            </Flex>
        </Flex>
    )
}

export default PageMappings
