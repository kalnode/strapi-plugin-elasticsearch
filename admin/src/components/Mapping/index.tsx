/**
 *
 * COMPONENT: Mapping
 *
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { Box, Button, Typography, Link, Icon, ToggleInput, TextInput,TextButton, Flex, Textarea, Table, Thead, Tbody, Tr, Td, Th, TFooter, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { apiGetMapping, apiCreateMapping, apiUpdateMapping, apiGetContentTypes } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { MappingFields } from '../MappingFields'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { getTypefromStrapiID } from '../../utils/getTypefromStrapiID'
import { useHistory } from "react-router-dom"
import { Pencil, Trash, ExclamationMarkCircle, Plus } from '@strapi/icons'

import * as Types from "../../../../types"

// LEGACY HARDCODED MAPPINGS, for reference.
// TODO: Delete when ready to.
// mappings: {
//     properties: {
//         "pin": {
//             type: "geo_point",
//             index: true
//         },
//         "Participants": {
//             type: "nested"
//         },
//         "Organizers": {
//             type: "nested"
//         },
//         "child_terms": {
//             type: "nested"
//         },        
//         // "uuid": {
//         //     type: "string",
//         //     index: "not_analyzed"
//         // }
//     }
// }

type Props = {
    mappingUUID: string
    indexUUID?: string
    type?: string
}

export const Mapping = ({ mappingUUID, indexUUID, type }:Props) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    const [contentTypes, setContentTypes] = useState<Types.StrapiContentTypes>()
    const [posttypeFinal, setPosttypeFinal] = useState<string>()
    const [mappingOriginal, setMappingOriginal] = useState<Types.Mapping>()
    const [mapping, setMapping] = useState<Types.Mapping>()
    const mappingUUIDComputed = useRef((mappingUUID && mappingUUID === 'new') || !mappingUUID ? null : mappingUUID)
    const history = useHistory()
    const showNotification = useNotification()

    const changesExist = useMemo(() => JSON.stringify(mapping) != JSON.stringify(mappingOriginal), [mapping])

    const resetForm = () => {
        setMapping(undefined)
        setMapping(mappingOriginal)
    }

    useEffect(() => {
        if (mappingUUID && mappingUUID != 'new') {
            requestGetMapping()
        }
    }, [])

    useEffect(() => {
        requestGetContentTypes()
    }, [])

    const mappingUpdated = (updatedMapping:Types.Mapping) => {
        if (mapping) {
            setMapping(updatedMapping)            
        }
    }

    // ===============================
    // API REQUESTS
    // ===============================

    const requestGetMapping = async () => {

        if (mappingUUID) {

            setIsInProgress(true)
            let work = await axiosInstance.get(apiGetMapping(mappingUUID))
            .then( (response) => {
                if (response.data) {
                    return response.data
                }
            })
            .catch((error) => {
                console.log("COMPONENT MAPPING - requestGetMapping error", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
            if (work) {
                let work2 = work

                setMappingOriginal(work2)
                setMapping(work2)
                setPosttypeFinal(work2.post_type)

            } else {
                // TODO: Maybe show an error view?
                console.log("Problem getting the mapping")
            }

        }
        
    }

    const requestGetContentTypes = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetContentTypes)
        .then((response) => {
            if (response.data) {
                setContentTypes(response.data)
                if (type && response.data && Object.keys(response.data).includes(type)) {
                    typeSelected(type)
                }
            }
        })
        .catch((error) => {
            console.log("COMPONENT MAPPING - requestGetContentTypes error", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    const requestCreateMapping = async () => {
        setIsInProgress(true)
        if (mapping && !mapping.uuid) {

            let output:Types.Mapping = mapping

            if (indexUUID) {
                output.indexes = [ indexUUID ]
            } else {
                output.preset = true
            }

            await axiosInstance.post(apiCreateMapping, {
                data: output
            })
            .then( async (response) => {
                let work = response.data
                setMappingOriginal(work)
                setMapping(work)

                if (indexUUID) {
                    await history.replace(`/plugins/${pluginId}/indexes/${indexUUID}/mappings/${response.data.uuid}`)

                } else {
                    await history.replace(`/plugins/${pluginId}/mappings/${response.data.uuid}`)
                }

            })
            .catch((error) => {
                console.log("COMPONENT MAPPING - requestCreateMapping error", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestUpdateMapping = () => {
        setIsInProgress(true)
        if (mapping && mapping.uuid) {
            return axiosInstance.post(apiUpdateMapping(mapping.uuid), {
                data: mapping
            })
            .then((response) => {
                setMapping(response.data)
                setMappingOriginal(response.data)
            })
            .catch((error) => {
                console.log("COMPONENT MAPPING - requestUpdateMapping error", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }


    // ===============================
    // FORM STUFF
    // ===============================

    const typeSelected = (posttype:string) => {
        let newMapping:Types.Mapping = {
            post_type: posttype,
        }

        setMappingOriginal(newMapping)
        setMapping(newMapping)
        setPosttypeFinal(posttype)
    }

    // TODO: Legacy; keep for now. Scrutnize form validation app-wide.
    // const validatePayload = (payload) => {
    //     if (payload && payload.length > 0) {
    //         try {
    //             JSON.parse(payload)
    //             return true
    //         } catch (e) {
    //             return false
    //         }
    //     } else {
    //         return true
    //     }
    // }


    // ===============================
    // TEMPLATE
    // ===============================

    return  (
        <Box>
            { contentTypes && Object.values(contentTypes).length > 0 && (
                <>

                {/* ---------------------------------------------- */}
                {/* HEADER */}
                {/* ---------------------------------------------- */}
                <Flex width="100%" justifyContent="space-between">
                    <Box>
                        <Box>
                            <Typography variant="alpha">{ mappingUUID && mappingUUID != 'new' ? 'Mapping ' + mappingUUID : indexUUID ? 'Create Mapping' : 'Create Preset Mapping'}</Typography>
                        </Box>

                        { posttypeFinal && (
                            <Flex gap={2}>
                                <Typography variant="beta">For post type: {getTypefromStrapiID(posttypeFinal)}</Typography>
                                <Typography variant="sigma">({posttypeFinal})</Typography>
                            </Flex>
                        )}
                    </Box>

                    { mappingUUID && mappingUUID != 'new' && (
                        <Flex gap={4}>

                            { changesExist && (
                                <>
                                    <Icon as={ExclamationMarkCircle} />
                                    <Typography variant="sigma">Unsaved changes</Typography>
                                    <TextButton onClick={() => resetForm()}>
                                        Reset
                                    </TextButton>
                                </>
                            )}

                            <Button onClick={() => requestUpdateMapping()} variant="secondary" disabled={!changesExist}>
                                Save
                            </Button>
                        </Flex>
                    )}

                    { (!mappingUUID || mappingUUID === 'new') && posttypeFinal && (
                        <Button onClick={() => requestCreateMapping()} variant="secondary">
                            { indexUUID ? 'Save New Mapping' : 'Save New Preset Mapping' }
                        </Button>
                    )}
                </Flex>


                {/* ---------------------------------------------- */}
                {/* MAIN CONTENT */}
                {/* ---------------------------------------------- */}

                { (!mappingUUID || mappingUUID === 'new') && !posttypeFinal && contentTypes && (
                    <Box width="100%">

                        <Table colCount={2} rowCount={contentTypes.length} width="100%">
                        {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                            <Thead>
                                <Tr>
                                    <Th>
                                        <Typography variant="sigma">Type</Typography>
                                    </Th>
                                    <Th>
                                        
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
                                            <Button onClick={() => typeSelected(key)}>Use Type</Button>
                                        </Td>
                                    </Tr>
                                )
                            }) }
                            </Tbody>
                        </Table>
                        <Box paddingTop={2} paddingBottom={2}>
                            <Typography textColor="neutral600">This view lists approved content types for mapping.</Typography>
                        </Box>
                    </Box>
                )}

                {/* -------- TABS ------------------*/}
                { posttypeFinal && (

                    <TabGroup initialSelectedTabIndex={0}>

                        {/* -------- TABS ACTUAL ------------------*/}
                        <Tabs>
                            <Tab id="fields">Fields</Tab>
                            <Tab id="raw">Raw Output</Tab>
                        </Tabs>

                        <TabPanels>

                            {/* -------- TAB: FIELDS ------------------*/}
                            <TabPanel id="fields">
                                {
                                    <MappingFields
                                    contentTypeNames={Object.keys(contentTypes[posttypeFinal])}
                                    mapping={mapping}
                                    mappingUpdated={(e:Types.Mapping) => mappingUpdated(e)}
                                    />
                                }
                            </TabPanel>

                            {/* -------- TAB: RAW OUTPUT ------------------*/}
                            <TabPanel id="raw">
                                <Box padding={4} background="neutral0" shadow="filterShadow">
                                    <Typography variant="beta">Preview raw output</Typography>
                                    <Box marginTop={2}>
                                        <Typography variant="delta">
                                            This is what the raw mapping output will look like when applied to an index Elasticsearch instance.
                                            Keep in mind, in that ES index, you may see other fields if additional mappings have been applied to it.
                                        </Typography>
                                    </Box>
                                    <Box padding={8} marginTop={4} background="secondary100">
                                        { !mapping || (mapping && !mapping.fields) && (
                                            <>(Please apply some mappings)</>
                                        )}
                                        { mapping && mapping.fields && (
                                            <pre>{ JSON.stringify(mapping.fields, null, 8) }</pre>
                                        )}
                                    </Box>
                                </Box>
                            </TabPanel>

                        </TabPanels>
                    </TabGroup>
                )}

                {/* <TextInput value={newMapping} onChange={(event) => { setNewMapping(event.target.value) }} label="Mapping name" placeholder="Enter mapping name" name="Mapping name field" /> */}
                {/* onChange={e => updateMappedFieldName(e.target.value)} value={config.searchFieldName || ""} */}

                {/* "post_type": {
                    "type": "string",
                    "required": true
                },
                "mapping": {
                    "type": "richtext"
                },
                "preset": {
                    "type": "string", // id of a preset mapping
                },
                "nested_level": {
                    "type": "number"
                },
                "registered_index": {
                    "type": "string", // id of a registered index
                },


                // "mapping_type": {
                //     "type": "string", // 'custom', 'preset'
                //     "required": true
                // },
                "default_preset": {
                    "type": "boolean"
                }, */}

                </>
            )}
        </Box>
    )
}