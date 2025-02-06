/**
 *
 * Mappings component
 *
 */

import { useEffect, useRef, useState } from 'react'
import pluginId from '../../pluginId'
import { Box, Flex, Button, ModalLayout, ModalHeader, Link, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TextInput, IconButton, CaretDown, Typography } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus, Cross } from '@strapi/icons'
import { apiGetMappings, apiDeleteMapping } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { useParams, useHistory } from 'react-router-dom'
import { requestUpdateIndex } from '../../utils/api/indexAPI'

export const Mappings = ({ indexId, showOnlyPresets, modeOnlySelection, mappingHasBeenSelected }) => {

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

        axiosInstance.get(apiGetMappings(indexId))
            .then((response) => {
                console.log("requestGetMappings dfdfdfd333",response.data)
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    
                    console.log("apiGetMappings 111", showOnlyPresets)
                    if (showOnlyPresets) {
                        console.log("apiGetMappings 222")
                        setMappings(response.data.filter( (x) => x.preset))
                    } else {
                        console.log("apiGetMappings 333")
                        setMappings(response.data)
                    }

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

    const requestDeleteMapping = (e, mappingIDNumber) => {
        e.stopPropagation()
        setIsInProgress(true)

        // TODO: Determine if mapping is preset or actual
        // If preset, just remove it, not delete

        let mapping = mappings.find( (x) => x.id === mappingIDNumber)

        // TODO: Add warning to user that they are attempting to delete a preset, which may be associated with another registered index
        if (mapping.preset) {
            console.log("Attempting to remove preset mapping from index")
        }
        
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

    const requestEditMapping = (mappingId) => {
        if (indexId) {
            history.push(`/plugins/${pluginId}/${indexId}/mappings/${mappingId}`)
        } else {
            history.push(`/plugins/${pluginId}/mappings/${mappingId}`)
        }
    }

    const handleRowClick = (mappingId) => {

        console.log("handleRowClick 111", mappingId)
        if (modeOnlySelection) {
            console.log("handleRowClick 333", mappingId)
            mappingHasBeenSelected(mappingId)
        } else {
            console.log("handleRowClick 444")
            if (indexId) {
                history.push(`/plugins/${pluginId}/indexes/${indexId}/mappings/${mappingId}`)
            } else {
                history.push(`/plugins/${pluginId}/mappings/${mappingId}`)
            }
        }
    }

    // ===============================
    // SELECT MAPPING
    // ===============================
    const [showSelectModal, setShowSelectModal] = useState(false)

    const modalSelectPresetMappingOpen = async () => {
        setShowSelectModal(true)
    }

    const modalSelectPresetMappingClose = async (selectedPreset) => {
        setShowSelectModal(false)
        if (selectedPreset) {
            console.log("modalSelectPresetMappingClose 111", indexId)
            //index.mappings = [...index.mappings, selectedPreset]
            console.log("modalSelectPresetMappingClose 222", selectedPreset)

            let payload = {}
            console.log("modalSelectPresetMappingClose 333", mappings)
            if (mappings) {
                console.log("modalSelectPresetMappingClose 444", mappings)
                payload.mappings = [...mappings, selectedPreset]
            } else {
                console.log("modalSelectPresetMappingClose 555", mappings)
                payload.mappings = [selectedPreset]
            }
            console.log("modalSelectPresetMappingClose 666", mappings)
            console.log("modalSelectPresetMappingClose 777 is: ", payload)
            await requestUpdateIndex(indexId, payload)
            requestGetMappings()
        }
    }

    return  (

        <Flex width="100%" direction="column" alignItems="start" gap={2} background="neutral100">
           
            <Box>
                <Typography variant="alpha">{ showOnlyPresets ? 'Preset Mappings' : 'Mappings'}</Typography>
            </Box>

            { !modeOnlySelection && (
                <Flex width="100%" gap={4} justifyContent="space-between">
                    {/* <Typography variant="delta">Actions</Typography>
                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestGetMappings}>Reload list</Button> */}

                    <Box>
                        {/* <IconButton onClick={ () => requestGetMappings() } label="Get mappings" icon={<Refresh />} /> */}
                    </Box>
                    
                    <Flex gap={4}>

                        { !indexId && (
                            <Link to={`/plugins/${pluginId}/mappings/new`}>
                                <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                    Create Preset Mapping
                                </Button>
                            </Link>
                        )}

                        { indexId && (
                            <Link to={`/plugins/${pluginId}/indexes/${indexId}/mappings/new`}>
                                <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                    Create Mapping
                                </Button>
                            </Link>
                        )}
                        
                        { indexId && (
                            <Button loading={isInProgress} fullWidth variant="secondary"
                            onClick={ () => modalSelectPresetMappingOpen() } style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                Add Preset Mapping
                            </Button>
                        )}
                    </Flex>
                </Flex>
            )}


            {/* ===================================== */}
            {/* ======== MAIN CONTENT =============== */}
            {/* ===================================== */}

            <Box width="100%" style={{ overflow: 'hidden' }}>

                {/* EMPTY CONTENT */}
                { (!mappings || (mappings && mappings.length === 0)) && (
                    <EmptyStateLayout icon={<Cross />} content="You don't have any content yet..." action={
                        <>
                        <Link to={`/plugins/${pluginId}/indexes/${indexId}/mappings/new`}>
                            <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                Create Mapping
                            </Button>
                        </Link>
                        <Button loading={isInProgress} fullWidth variant="secondary"
                        onClick={ () => modalSelectPresetMappingOpen() } style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                            Add Preset Mapping
                        </Button>
                        </>
                    } />
                ) }

                {/* DISPLAY RECORDS  */}
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

                                    {/* <Th>
                                        <Typography variant="sigma">Nested Level</Typography>
                                    </Th> */}

                                    { !indexId && (
                                        <Th>
                                            <Typography variant="sigma">Preset Default</Typography>
                                        </Th>
                                    )}
                                </Tr>
                            </Thead>
                            <Tbody>
                            { mappings.map((data, index) => {
                                return (
                                    <Tr key={index} className="row" onClick={() => handleRowClick(data.id) }>
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
                                            <Typography textColor="neutral600">{data.preset ? 'Yes' : '' }</Typography>
                                        </Td>
                                        {/* <Td>
                                            <Typography textColor="neutral600">{data.nested_level}</Typography>
                                        </Td> */}

                                        { !indexId && (
                                            <Td>
                                                <Typography textColor="neutral600">{data.default_preset}</Typography>
                                            </Td>
                                        )}

                                        <Td>
                                            <Flex alignItems="end" gap={2}>
                                                <IconButton label="Edit mapping" noBorder icon={<Pencil />} onClick={() => requestEditMapping(data.id) } />

                                                { !modeOnlySelection && (
                                                    <IconButton onClick={(e) => requestDeleteMapping(e, data.id)} label="Delete" borderWidth={0} icon={<Trash />} />
                                                )}
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
                <ModalLayout onClose={() => setShowSelectModal(false)}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Select preset mapping
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Box width="100%">
                            <Mappings showOnlyPresets="true" modeOnlySelection="true" mappingHasBeenSelected={(e) => modalSelectPresetMappingClose(e)} />
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
        </Flex>
    )
}