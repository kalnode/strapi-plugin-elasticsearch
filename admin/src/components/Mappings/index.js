/**
 *
 * Mappings component
 *
 */

import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TextInput, IconButton, CaretDown, Typography } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus } from '@strapi/icons'
import { apiGetMapping, apiGetMappings, apiCreateMapping, apiUpdateMapping, apiDeleteMapping, apiGetContentTypes } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { useParams, useHistory } from 'react-router-dom'
import { Mapping } from '../../components/Mapping'

export const Mappings = ({ indexId, showOnlyPresets, modeOnlySelection }) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    const [mappings, setMappings] = useState(null)
    const history = useHistory()
    const showNotification = useNotification()

    useEffect(() => {
        requestGetMappings()
    }, [])

    const requestGetMappings = () => {
        setIsInProgress(true)
        console.log("Mappings component requestGetMappings: ", indexId)

        //showOnlyPresets

        axiosInstance.get(apiGetMappings(indexId))
            .then((response) => {
                console.log("requestGetMappings dfdfdfd333",response.data)
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    
                    // if (showOnlyPresets) {
                    //     setMappings(response.data.filter( (x) => !x.registered_index))
                    // } else {
                    //     setMappings(response.data)
                    // }

                    setMappings(response.data)
                } else {
                    setMappings(null)
                }
            })
            .catch((error) => {
                console.log("PAGE MAPPINGS - requestGetMappings ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
    }

    // ===============================
    // CREATE NEW MAPPING
    // ===============================
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedType, setSelectedType] = useState(null)
    const [contentTypes, setContentTypes] = useState(null)

    const getContentTypes = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiGetContentTypes)
            .then((response) => {
                setContentTypes(response.data)
            })
            .catch((error) => {
                console.log("PAGE MAPPINGS - getContentTypes ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
    }

    const modalCreateMappingOpen = async () => {
        setSelectedType(null)
        await getContentTypes()
        setShowCreateModal(true)
    }

    const modalCreateMappingClose = async (reload) => {
        setSelectedType(null)
        setShowCreateModal(false)
        console.log("modalCreateMappingClose 112233 ", reload)
        if (reload) {
            requestGetMappings()
        }
    }

    const requestDeleteMapping = (e, mappingIDNumber) => {
        e.stopPropagation()
        setIsInProgress(true)

        // TODO: Determine if mapping is preset or actual
        // If preset, just remove it, not delete

        let mapping = mappings.find( (x) => x.id === mappingIDNumber)

        if (mapping.preset) {
            console.log("Attempting to remove preset mapping from index")
        } else {
            return axiosInstance.get(apiDeleteMapping(mappingIDNumber))
            .then((response) => {
                console.log("Delete response is: ", response)
            })
            .catch((error) => {
                console.log("PAGE MAPPINGS - requestDeleteMapping ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                requestGetMappings()
            })
        }
    }

    // ===============================
    // SELECT MAPPING
    // ===============================
    const [showSelectModal, setShowSelectModal] = useState(false)

    const modalSelectPresetMappingOpen = async () => {
        setShowSelectModal(true)
    }

    const modalSelectPresetMappingClose = async (reload) => {
        setShowSelectModal(false)
        if (reload) {
            requestGetMappings()
        }
    }

    return  (

        <Flex width="100%" direction="column" alignItems="start" gap={2} background="neutral100">
           
            <Box>
                <Typography variant="alpha">{ showOnlyPresets ? 'Preset Mappings' : 'Mappings'}</Typography>
            </Box>

            { !modeOnlySelection && (
                <Box>
                    <Flex gap={4}>
                        {/* <Typography variant="delta">Actions</Typography>
                        <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestGetMappings}>Reload list</Button> */}
                        <IconButton onClick={ () => requestGetMappings() } label="Get mappings" icon={<Refresh />} />
                        
                        { indexId && (
                        <Button loading={isInProgress} fullWidth variant="secondary" onClick={ () => modalCreateMappingOpen() } style={{ whiteSpace: 'no-wrap' }} startIcon={<Plus />}>
                            Create Mapping
                        </Button>
                        )}
                        
                        
                        <Button loading={isInProgress} fullWidth variant="secondary"
                        onClick={ () => modalSelectPresetMappingOpen() } style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                            Add Preset Mapping
                        </Button>
                    </Flex>
                </Box>
            )}

            <Box width="100%" style={{ overflow: 'hidden' }}>
                { !mappings || (mappings && mappings.length === 0) && (
                    <EmptyStateLayout icon={<Cross />} content="You don't have any content yet..." action={
                        <>
                        <Button variant="secondary" startIcon={<Plus />} style={{ whiteSpace: 'nowrap' }}>
                            Create a preset mapping
                        </Button>
                        <Button loading={isInProgress} fullWidth variant="secondary"
                        onClick={ () => modalSelectPresetMappingOpen() } style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                            Add Preset Mapping
                        </Button>
                        </>
                    } />
                ) }

                { mappings && Array.isArray(mappings) && mappings.length > 0 && (
                    <>
                       <Table colCount={7} rowCount={mappings.length} width="100%">
                        {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                            <Thead>
                                <Tr>
                                    <Th>
                                        <Checkbox aria-label="Select all entries" className="checkbox" />
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Post Type</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Mapping</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Preset</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Nested Level</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Index Name</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Default</Typography>
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                            { mappings.map((data, index) => {
                                return (
                                    <Tr key={index} className="row" onClick={() => {
                                        if (indexId) {
                                            history.push(`/plugins/${pluginId}/indexes/${indexId}/mappings/${data.id}`)
                                        } else {
                                            history.push(`/plugins/${pluginId}/mappings/${data.id}`)
                                        }
                                    }
                                    }>
                                        <Td>
                                            <Checkbox aria-label={`Select ${data.id}`} className="checkbox" />
                                        </Td>
                                        <Td style={{ overflow: 'hidden' }}>
                                            <Typography textColor="neutral600">{data.post_type}</Typography>
                                        </Td>
                                        <Td style={{ overflow: 'hidden', maxWidth: '200px' }}>
                                            <Typography textColor="neutral600">{data.mapping}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.preset}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.nested_level}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.registered_index}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.default_preset}</Typography>
                                        </Td>
                                        <Td>
                                            <Flex alignItems="end" gap={2}>
                                                {/* <IconButton onClick={(e) => editMapping(data.id)} label="Edit" borderWidth={0}>
                                                    <Pencil />
                                                </IconButton> */}
                                                <IconButton label="Edit mapping" noBorder icon={<Pencil />} />
                                                {/* onClick={() => history.push(`/plugins/${pluginId}/mapping/${data.id}`)} */}

                                                <IconButton onClick={(e) => requestDeleteMapping(e, data.id)} label="Delete" borderWidth={0} icon={<Trash />} />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                )
                            }) }
                            </Tbody>
                        </Table>
                        <Box paddingTop={2} paddingBottom={2}>
                            <Typography textColor="neutral600">This view lists mappings (in the context of this plugin).</Typography>
                        </Box> 
                    </>
                ) }
            </Box>

            { showSelectModal && (
                <ModalLayout onClose={() => modalSelectPresetMappingClose()}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Select preset mapping
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Box width="100%">
                            <Mappings showOnlyPresets="true" modeOnlySelection="true" />
                            {/* closeEvent={(e) => modalSelectPresetMappingClose(e)} */}
                        </Box>                        
                    </ModalBody>

                    {/* <ModalFooter
                        startActions={
                            <Button onClick={() => console.log("Click!! 32324")} variant="tertiary">
                                Cancel
                            </Button>
                        }
                        endActions={
                            <>
                            <Button loading={isInProgress} onClick={() => console.log("Click!! 35fffff")}>
                                Import
                            </Button>
                            </>
                        }
                    /> */}
                    
                </ModalLayout>

            ) }



            { showCreateModal && (
                <ModalLayout onClose={() => modalCreateMappingClose()}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Create mapping
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Box width="100%">
                            { !contentTypes || (contentTypes && Object.values(contentTypes).length === 0) && ( <> No content types found </> ) }

                            { contentTypes && Object.values(contentTypes).length > 0 && (
                                <>
                                    { !selectedType && (
                                        <>                                                
                                            <Table colCount={3} rowCount={mappings.length} width="100%">
                                            {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                                                <Thead>
                                                    <Tr>
                                                        <Th>
                                                            <Typography variant="sigma">Name</Typography>
                                                        </Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                { Object.keys(contentTypes).map((key, index) => {
                                                    return (
                                                        <Tr key={index}>
                                                            <Td>
                                                                <Typography textColor="neutral600">{key}</Typography>
                                                            </Td>
                                                            <Td>
                                                                <Button onClick={() => setSelectedType(key)}>Use Type</Button>
                                                            </Td>
                                                        </Tr>
                                                    )
                                                }) }
                                                </Tbody>
                                            </Table>
                                            <Box paddingTop={2} paddingBottom={2}>
                                                <Typography textColor="neutral600">This view lists approved content types for mapping.</Typography>
                                            </Box>
                                        </>
                                    ) }

                                    { selectedType && (
                                        <>
                                            <Mapping posttype={selectedType} indexId={indexId} closeEvent={(e) => modalCreateMappingClose(e)} />
                                        </>
                                    )}
                                </>
                            ) }
                        </Box>
                        
                    </ModalBody>

                    {/* <ModalFooter
                        startActions={
                            <Button onClick={() => console.log("Click!! 32324")} variant="tertiary">
                                Cancel
                            </Button>
                        }
                        endActions={
                            <>
                            <Button loading={isInProgress} onClick={() => console.log("Click!! 35fffff")}>
                                Import
                            </Button>
                            </>
                        }
                    /> */}
                    
                </ModalLayout>

            ) }

        </Flex>
    )
}