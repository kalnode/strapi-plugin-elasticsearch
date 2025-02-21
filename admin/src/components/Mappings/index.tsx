/**
 *
 * COMPONENT: Mappings
 *
 */

import { useEffect, useRef, useState } from 'react'
import pluginId from '../../pluginId'
import { Box, Flex, Button, ModalLayout, ModalHeader, Link, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TabGroup, Tabs, Tab, TabPanels, TabPanel, TextInput, IconButton, CaretDown, Typography } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus, Cross } from '@strapi/icons'
import { apiGetMappings, apiDeleteMapping, apiDetachMappingFromIndex, apiGetESMapping } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { useParams, useHistory } from 'react-router-dom'
import { requestUpdateIndex } from '../../utils/api/indexAPI'
import { JSONTree } from 'react-json-tree'
import { Mapping } from "../../../../types"

type Props = {
    indexUUID?: string
    showOnlyPresets?: boolean
    modeOnlySelection?: boolean
    mappingHasBeenSelected?: any // TODO: Should this be an.. object? Function? What? We're passing a function through this.
}

// export default ({ indexUUID, showOnlyPresets, modeOnlySelection, mappingHasBeenSelected }:Props) => {
//     Mappings({ indexUUID, showOnlyPresets, modeOnlySelection, mappingHasBeenSelected })
// }
export const Mappings = ({ indexUUID, showOnlyPresets, modeOnlySelection, mappingHasBeenSelected }:Props) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)

    const [mappings, setMappings] = useState<Array<Mapping>>([])
    const history = useHistory()
    const showNotification = useNotification()
    const [ESMapping, setESMapping] = useState(null)

    useEffect(() => {
        requestGetMappings()
        requestGetESMapping()
    }, [])

    const requestGetMappings = () => {
        setIsInProgress(true)

        axiosInstance.get(apiGetMappings(indexUUID))
        .then((response) => {
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {

                // TODO: Legacy idea here of "preset", however if mappings are not binded to indexes, then they're _all_ presets, in theory.
                // Keeping for now.
                if (showOnlyPresets) {
                    setMappings(response.data.filter( (x) => x.preset))
                } else {
                    setMappings(response.data)
                }

            } else {
                setMappings([])
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

    const requestDeleteMapping = (e:Event, mapping:Mapping) => {
        e.stopPropagation()
        setIsInProgress(true)

        // TODO: Determine if mapping is preset or actual
        // If preset, just remove it, not delete

        // TODO: Should we do this by UUID? Anything wrong with doing it by id?
        //let mapping = mappings.find( (x) => x.uuid === mappingUUID)

        // TODO: Add warning to user that they are attempting to delete a preset, which may be associated with another registered index

        // ONLY DETACH MAPPING FROM INDEX
        if (indexUUID && mapping.preset) {
            return axiosInstance.post(apiDetachMappingFromIndex, {
                data: { mappingUUID: mapping.uuid, indexUUID: indexUUID }
            })
            .then((response) => {
                // console.log("Mapping detached from index: ", response)
            })
            .catch((error) => {
                console.log("PAGE MAPPINGS - apiDetachMappingFromIndex ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                requestGetMappings()
            })

        // HARD DELETE
        } else {
            return axiosInstance.get(apiDeleteMapping(mapping.uuid))
            .then((response) => {
                // console.log("Delete response is: ", response)
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

    const requestEditMapping = (e:Event, mappingUUID:string) => {
        e.stopPropagation()
        if (indexUUID) {
            history.push(`/plugins/${pluginId}/${indexUUID}/mappings/${mappingUUID}`)
        } else {
            history.push(`/plugins/${pluginId}/mappings/${mappingUUID}`)
        }
    }

    const requestGoToIndex = (e:Event, indexUUID:string) => {
        e.stopPropagation()
        if (indexUUID) {
            history.push(`/plugins/${pluginId}/indexes/${indexUUID}`)
        }
    }

    const handleRowClick = (mappingUUID:string) => {
        if (modeOnlySelection) {
            mappingHasBeenSelected(mappingUUID)
        } else {
            if (indexUUID) {
                history.push(`/plugins/${pluginId}/indexes/${indexUUID}/mappings/${mappingUUID}`)
            } else {
                history.push(`/plugins/${pluginId}/mappings/${mappingUUID}`)
            }
        }
    }

    const requestGetESMapping = () => {
        setIsInProgress(true)

        axiosInstance.get(apiGetESMapping(indexUUID))
        .then((response) => {
            if (response.data) {
                setESMapping(response.data)
            } else {
                setESMapping(null)
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

    const rawMappingsCombined = useRef(() => {
        if (mappings) {
            return mappings.map( (x:Mapping) => x.mappingRaw)
        }
        return null
    })

    // ===============================
    // SELECT PRESET MAPPING
    // ===============================
    const [showSelectModal, setShowSelectModal] = useState(false)

    const modalSelectPresetMappingOpen = async () => {
        setShowSelectModal(true)
    }

    const modalSelectPresetMappingClose = async (selectedPreset:Mapping) => {
        setShowSelectModal(false)
        if (selectedPreset) {
            let mappings:Array<Mapping> = []
            if (mappings) {
                mappings = [...mappings, selectedPreset]
            } else {
                mappings = [selectedPreset]
            }
            await requestUpdateIndex(indexUUID, { mappings: mappings })
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
                        { indexUUID && (
                            <Link to={`/plugins/${pluginId}/indexes/${indexUUID}/mappings/new`}>
                                <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                    Create Mapping
                                </Button>
                            </Link>
                        )}
                        { !indexUUID && (
                            <Link to={`/plugins/${pluginId}/mappings/new`}>
                                <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                    Create Preset Mapping
                                </Button>
                            </Link>
                        )}
                        { indexUUID && (
                            <Button loading={isInProgress} variant="secondary"
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

                {/* DISPLAY RECORDS  */}

                <TabGroup initialSelectedTabIndex={0}>

                    {/* -------- TABS ACTUAL ------------------*/}
                    <Tabs>
                        <Tab id="mappings">Mappings</Tab>
                        <Tab id="raw">Raw Output</Tab>
                        <Tab id="raw_es">Raw ES</Tab>
                    </Tabs>

                    <TabPanels>

                        {/* -------- TAB: FIELDS ------------------*/}
                        <TabPanel id="mappings">

                            {/* EMPTY CONTENT */}
                            { (!mappings || (mappings && mappings.length === 0)) && (
                                <EmptyStateLayout icon={<Cross />} content="You don't have any mappings yet..." action={
                                    <Flex gap={4}>
                                        { indexUUID && (
                                            <Link to={`/plugins/${pluginId}/indexes/${indexUUID}/mappings/new`}>
                                                <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                                    Create Mapping
                                                </Button>
                                            </Link>
                                        )}
                                        { !indexUUID && (
                                            <Link to={`/plugins/${pluginId}/mappings/new`}>
                                                <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                                    Create Preset Mapping
                                                </Button>
                                            </Link>
                                        )}
                                        { indexUUID && (
                                            <Button loading={isInProgress} variant="secondary"
                                            onClick={ () => modalSelectPresetMappingOpen() } style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                                Add Preset Mapping
                                            </Button>
                                        )}
                                    </Flex>
                                } />
                            ) }

                            { mappings && Array.isArray(mappings) && mappings.length > 0 && (
                            <>

                            <Table colCount={8} rowCount={mappings.length} width="100%">
                                {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                                <Thead>
                                    <Tr>
                                        <Th>
                                            <Checkbox aria-label="Select all entries" className="checkbox" />
                                        </Th>
                                        <Th>
                                            <Typography variant="sigma">UUID</Typography>
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

                                        { !indexUUID && (
                                            <Th>
                                                <Typography variant="sigma">Preset Default</Typography>
                                            </Th>
                                        )}

                                        { !indexUUID && (
                                            <Th>
                                                <Typography variant="sigma">Index(s)</Typography>
                                            </Th>
                                        )}
                                    </Tr>
                                </Thead>
                                <Tbody>
                                { mappings.map((mapping, index) => {
                                    return (
                                        <Tr key={index} className="row" onClick={() => handleRowClick(mapping.uuid!) }>
                                            <Td>
                                                <Checkbox aria-label={`Select ${mapping.uuid}`} className="checkbox" />
                                            </Td>
                                            <Td style={{ overflow: 'hidden' }}>
                                                <Typography textColor="neutral600">{mapping.uuid}</Typography>
                                            </Td>
                                            <Td style={{ overflow: 'hidden' }}>
                                                <Typography textColor="neutral600">{mapping.post_type}</Typography>
                                            </Td>
                                            <Td style={{ overflow: 'hidden', maxWidth: '200px' }}>
                                                <Typography textColor="neutral600">{mapping.mappingRaw}</Typography>
                                            </Td>
                                            <Td>
                                                <Typography textColor="neutral600">{mapping.preset ? 'Yes' : '' }</Typography>
                                            </Td>
                                            {/* <Td>
                                                <Typography textColor="neutral600">{data.nested_level}</Typography>
                                            </Td> */}

                                            { !indexUUID && (
                                                <Td>
                                                    <Typography textColor="neutral600">{mapping.default_preset}</Typography>
                                                </Td>
                                            )}

                                            { !indexUUID && (
                                                <Td>
                                                        {/* TODO: Re-introduce displaying what indexes the mapping belongs to */}
                                                        {/* { data.indexes && data.indexes.length > 0 && (
                                                            <>
                                                            { data.indexes.map((item, indexItem) => {
                                                                    return (
                                                                        <Box key={indexItem}>
                                                                            <Link onClick={(e) => { requestGoToIndex(e, item.uuid) } } key={indexItem}>
                                                                                { item.uuid }
                                                                            </Link>                                                                    
                                                                            { indexItem != data.indexes.length && (
                                                                                <>&nbsp;</>
                                                                            ) }
                                                                        </Box>
                                                                    )
                                                                })
                                                            }
                                                            </>
                                                        )} */}
                                                </Td>
                                            )}

                                            <Td>
                                                <Flex alignItems="end" gap={2}>
                                                    <IconButton label="Edit mapping" noBorder icon={<Pencil />} onClick={ (e:Event) => requestEditMapping(e, mapping.uuid!) } />

                                                    { !modeOnlySelection && (
                                                        <IconButton onClick={ (e:Event) => requestDeleteMapping(e, mapping) } label="Delete" borderWidth={0} icon={<Trash />} />
                                                    )}
                                                </Flex>
                                            </Td>
                                        </Tr>
                                    )
                                }) }
                                </Tbody>
                            </Table>
                            <Box paddingTop={2} paddingBottom={2}>
                                <Typography textColor="neutral600">List of mappings</Typography>
                            </Box>
                       
                            </>
                            ) }

                        </TabPanel>

                        {/* -------- TAB: RAW OUTPUT ------------------*/}
                        <TabPanel id="raw">
                            { mappings && Array.isArray(mappings) && mappings.length > 0 && (
                            <>
                            <Box padding={4} background="neutral0" shadow="filterShadow">
                                <Typography variant="beta">Preview raw output</Typography>
                                <Box marginTop={2}>
                                    <Typography variant="delta">
                                        This is what the raw mapping output will look like when applied to an index Elasticsearch instance.
                                        Keep in mind, in that ES index, you may see other fields if additional mappings have been applied to it.
                                    </Typography>
                                </Box>
                                <Box padding={8} marginTop={4} background="secondary100">
                                    { !rawMappingsCombined && (
                                        <>(Please apply some mappings)</>
                                    )}
                                    { rawMappingsCombined && (
                                        <pre>{ JSON.stringify(rawMappingsCombined, null, 8) }</pre>
                                    )}
                                </Box>
                            </Box>
                            </>
                            ) }
                        </TabPanel>


                        {/* -------- TAB: ES MAPPING ------------------*/}
                        <TabPanel id="raw_es">
                            <Box padding={4} background="neutral0" shadow="filterShadow">
                                <Typography variant="beta">Mapping currently applied to ES Index</Typography>
                                <Box marginTop={2}>
                                    <Typography variant="delta">
                                        The current mapping as it exists on the ES index.
                                    </Typography>
                                </Box>
                                <Box marginTop={4} background="secondary100">
                                    { !ESMapping && (
                                        <>(No mapping found on ES index)</>
                                    )}
                                    { ESMapping && (

                                        // KEEP FOR NOW; old way showing static <pre>
                                        // <pre>{ JSON.stringify(Object.values(ESMapping)[0].mappings.properties, null, 8) }</pre>

                                        // TODO: In below data= prop we're inline casting type as any to satisfy TS warnings. Is there a better way? How to do this properly?
                                        // TODO: Below we simply want the 'light' default theme but so far we have to pass a full theme object to allow for invertTheme to work. It's stupid and messy.
                                        <JSONTree data={ (Object.values(ESMapping)[0] as unknown as any).mappings.properties } theme={{
                                            scheme: 'default',
                                            author: 'chris kempson (http://chriskempson.com)',
                                            base00: '#181818',
                                            base01: '#282828',
                                            base02: '#383838',
                                            base03: '#585858',
                                            base04: '#b8b8b8',
                                            base05: '#d8d8d8',
                                            base06: '#e8e8e8',
                                            base07: '#f8f8f8',
                                            base08: '#ab4642',
                                            base09: '#dc9656',
                                            base0A: '#f7ca88',
                                            base0B: '#a1b56c',
                                            base0C: '#86c1b9',
                                            base0D: '#7cafc2',
                                            base0E: '#ba8baf',
                                            base0F: '#a16946'
                                          }} invertTheme={true} />
                                    )}
                                </Box>
                            </Box>
                        </TabPanel>

                    </TabPanels>
                </TabGroup>



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
                            <Mappings showOnlyPresets={true} modeOnlySelection={true} mappingHasBeenSelected={ (mapping:Mapping) => modalSelectPresetMappingClose(mapping) } />
                            {/* closeEvent={(e) => modalSelectPresetMappingClose(e)} */}
                        </Box>                        
                    </ModalBody>
                    {/* <ModalFooter
                        startActions={<></>}
                        endActions={<></>}
                    /> */}
                </ModalLayout>

            ) }
        </Flex>
    )
}