/**
 *
 * Mapping component
 *
 */

import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { Box, Button, Typography, ToggleInput, TextInput, Flex, Textarea, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { apiGetMapping, apiGetMappings, apiCreateMapping, apiUpdateMapping, apiDeleteMapping, apiGetContentTypes } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'

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



export const Mapping = ({ posttype, mappingId, closeEvent }) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    const [contentTypes, setContentTypes] = useState(null)
    const [postTypeFields, setPostTypeFields] = useState(null)
    const [posttypeFinal, setPosttypeFinal] = useState(null)
    const [mapping, setMapping] = useState(null)
    const showNotification = useNotification()

    const requestGetMapping = async () => {

        if (mappingId) {
            setIsInProgress(true)
            let work = await axiosInstance.get(apiGetMapping(mappingId))
                .then( (response) => {
                    console.log("get requestGetMapping 111: ", response)
                    if (response.data) {
                        return response.data
                    }
                })
                // .catch((error) => {
                //     console.log("PAGE requestGetMapping ERROR: ", error)
                //     showNotification({
                //         type: "warning", message: "An error has encountered: " + error, timeout: 5000
                //     })
                // })
                // .finally(() => {
                //     setIsInProgress(false)
                //     //getContentTypes()
                // })


            console.log("Work is: ", work)


            let work2 = work

            work2.mapping = JSON.parse(work2.mapping)
            setMapping(work2)
            setPosttypeFinal(work2.post_type)


           
            
            // , function() {
            //     getContentTypes()
            //   })

            //setCounter(counter => ({ mona: counter.mona, phil: counter.phil + 1 }));

                //setTimeout(async () => {
                    //console.log("response.data 222: ", mapping)

            //getContentTypes()
                //}, 3000);
        }
        
    }

    const getContentTypes = async () => {
        setIsInProgress(true)
    
        let work = await axiosInstance.get(apiGetContentTypes)
            .then((response) => {
                console.log("PAGE getContentTypes response: ", response.data)
                // showNotification({
                //     type: "success", message: "getContentTypes: " + response.data, timeout: 5000
                // })
                return response.data
            })
            .catch((error) => {
                console.log("PAGE getContentTypes ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })

        setContentTypes(work)

        
    }

    const setPostTypeFinal222 = () => {
        let posttypeWork
        if (mapping && mapping.post_type) {
            console.log("posttypeWork is 111: ", mapping)
            posttypeWork = mapping.post_type
            setPosttypeFinal(mapping.post_type)
        } else if (posttype) {
            console.log("posttypeWork is 222: ", posttype)
            posttypeWork = posttype
            setPosttypeFinal(posttype)
        }
        console.log("posttypeWork is 333: ", mapping)
        console.log("posttypeWork is 444: ", posttypeWork)
        if (posttypeWork) {
            setPosttypeFinal(posttypeWork)
        }

    }

    const requestCreateMapping = () => {
        setIsInProgress(true)

        return axiosInstance.post(apiCreateMapping, {
            data: mapping
        })
        .then((response) => {
            console.log("PAGE requestCreateMapping response: ", response)
            // showNotification({
            //     type: "success", message: "Created the mapping: " + response, timeout: 5000
            // })
        })
        .catch((error) => {
            console.log("PAGE requestCreateMapping ERROR: ", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
            closeEvent(true)
        })
    }


    const requestUpdateMapping = () => {
        setIsInProgress(true)

        console.log("requestUpdateMapping is: ", mapping)

        let output = {...mapping}

        output.mapping = JSON.stringify(output.mapping)

        console.log("requestUpdateMapping Output is: ", output)

        return axiosInstance.post(apiUpdateMapping(mappingId), {
            data: mapping
        })
            .then((response) => {
                console.log("PAGE requestUpdateMapping response: ", response)
                // showNotification({
                //     type: "success", message: "Created the mapping: " + response, timeout: 5000
                // })
            })
            .catch((error) => {
                console.log("PAGE requestUpdateMapping ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
    }


    // ===============================
    // FORM STUFF
    // ===============================

    const updateFieldActive = async (key) => {
        // let output = { ...mapping }
        // if (output[key]) {
        //     delete output[key]
        // } else {
        //     output = { ...output, [key]: { active: true } }
        // }
        // await setMapping(output)
        console.log("updateFieldActive 111aaa", mapping)
        let output = { ...mapping }
        console.log("updateFieldActive 111bbb", mapping)
        if (output.mapping[key]) {
            delete output.mapping[key]
        } else {
            console.log("updateFieldActive 222", mapping)
            //output = { ...output, [key]: { } }
            output.mapping[key] = {}
        }
        console.log("updateFieldActive 333", output)
        await setMapping(output)
    }

    const updateFieldIndex = async (key) => {
        let output = { ...mapping }
        if (output.mapping[key]) {
            output.mapping[key].index = !output.mapping[key].index
            await setMapping(output)
        }
    }

    const updateFieldDataType = async (key, type) => {
        let output = { ...mapping }
        if (output.mapping[key]) {
            console.log("Hello? wer45435", type)
            //let output = { ...mapping }
            output.mapping[key].type = type
            await setMapping(output)
        }
    }

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
    // LIFECYCLE
    // ===============================

    useEffect(() => {
        console.log("useEffect1 - requestGetMapping", mappingId)

        // EXISTING MAPPING
        if (mappingId) {
            requestGetMapping()

        // NEW MAPPING
        } else if (posttype) {

            
            setMapping({
                "post_type": posttype,
                "mapping": {}
                //"preset": 'dfdf'
                //"nested_level": 2
                //"registered_index": 'someregindex'
                //"mapping_type": 'custom',
                //"default_preset": true
            })

            setPosttypeFinal(posttype)
        }
        //  else if (posttype) {
        //     console.log("Mounted 3333 ")
        //     getContentTypes()
        // }

    }, [])


    useEffect(() => {
        console.log("useEffect2 - getContentTypes")
        getContentTypes()
    }, [])

    useEffect(() => {
        //console.log("useEffect3 - setPostTypeFinal222")
        //setPostTypeFinal222()
    }, [])

    return  (
        <Box>
            { contentTypes && posttypeFinal && contentTypes[posttypeFinal] && (
                <>
                <Flex width="100%" justifyContent="space-between">
                    <Box>
                        <Box>
                            <Typography variant="alpha">{ mappingId ? 'Edit Mapping: ' + mappingId : 'Create Mapping'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="beta">For post type: {posttypeFinal}</Typography>
                        </Box>
                    </Box>

                    { mappingId && (
                        <>
                        <Button onClick={() => requestUpdateMapping()} variant="tertiary">
                            Save
                        </Button>
                        </>
                    )}

                    { !mappingId && (
                        <Button onClick={() => requestCreateMapping()} variant="tertiary">
                            Create Mapping
                        </Button>
                    )}                    

                </Flex>

                {/* <Tabs aria-label="Manage your attribute">
                    <Tab value="base">Base</Tab>
                    <Tab value="advanced">Advanced</Tab>
                </Tabs>
                <TabPanels>
                    <TabPanel value="base">
                        tab 1
                    </TabPanel>
                    <TabPanel value="advanced">
                        tab 2
                    </TabPanel>
                </TabPanels> */}


                <TabGroup initialSelectedTabIndex={0}>
                    <Tabs>
                        <Tab id="fields">Fields</Tab>
                        <Tab id="raw">Raw</Tab>
                    </Tabs>
                    <TabPanels>

                        <TabPanel id="fields">
                            {
                                
                                Object.entries(contentTypes[posttypeFinal]).map(([key,val]) => {
                                //Object.keys(fields).map((key,index) => {
                                    
                                    return (
                                        
                                        <Box key={key}>
                                            <Typography variant="beta">{ key }</Typography>
                                            {/* <div>field is: { val }</div> */}

                                                <Flex gap={4} width='100%' style={{ justifyContent: 'space-between'}}>

                                                    <Flex direction='column' style={{ alignSelf: 'stretch' }}>
                                                        <div style={{fontSize: '0.75rem', lineHeight: '1.33'}}>
                                                            <Typography variant="pi" fontWeight={'bold'}>Enabled</Typography>
                                                        </div>
                                                        <div style={{height: '100%', alignContent: 'center'}}>

                                                        {/* selected={mapping[key]} */}

                                                        {/* { mapping && (
                                                            <>
                                                            <div>
                                                                selected is: {JSON.stringify(mapping)}
                                                            </div>
                                                            </>
                                                        )} */}

                                                            <Switch
                                                                selected={mapping && mapping.mapping[key] && Object.hasOwn(mapping.mapping, key)}
                                                                onChange={(e) => updateFieldActive(key)}
                                                                label='Active'
                                                                onLabel='Enabled'
                                                                offLabel='Disabled' />
                                                                {/* checked={config.index} onChange={(e) => updateIndex(e.target.checked)}  */}
                                                        </div>
                                                    </Flex>

                                                    <Flex style={{flexDirection: 'column', alignSelf: 'stretch'}}>
                                                        <div style={{fontSize: '0.75rem', lineHeight: '1.33'}}>
                                                            <Typography variant="pi" fontWeight={'bold'}>Index</Typography>
                                                        </div>
                                                        <div style={{height: '100%', alignContent: 'center'}}>
                                                            <Switch
                                                                selected={mapping && mapping.mapping[key] && mapping.mapping[key].index}
                                                                onChange={(e) => updateFieldIndex(key)}
                                                                disabled={mapping && !mapping.mapping[key]}                                            
                                                                label='Index'
                                                                onLabel='Enabled'
                                                                offLabel='Disabled' />
                                                                {/* style={{background:'pink !important'}} */}
                                                                
                                                        </div>
                                                    </Flex>

                                                    {/* onClick={toggleIndexingEnabled}
                                                    selected={indexingEnabled} */}

                                                    {/* <TextInput label="Data Type" placeholder="Enter explicit data type" name="Data Type" /> */}
                                                    {/* onChange={e => updateMappedFieldName(e.target.value)} value={config.searchFieldName || ""} */}

                                                    <Box style={{flex: '1'}}>
                                                        <SingleSelect
                                                            label="Data Type"
                                                            value={mapping && mapping.mapping[key] && mapping.mapping[key].type}
                                                            onChange={ (value) => updateFieldDataType(key, value)}
                                                            disabled={mapping && !mapping.mapping[key]}>
                                                            <SingleSelectOption value="dynamic">(autodetect)</SingleSelectOption>
                                                            <SingleSelectOption value="binary">Binary</SingleSelectOption>
                                                            <SingleSelectOption value="boolean">Boolean</SingleSelectOption>
                                                            <SingleSelectOption value="keyword">Keyword</SingleSelectOption>
                                                            <SingleSelectOption value="text">Text</SingleSelectOption>
                                                            <SingleSelectOption value="long">Number long</SingleSelectOption>
                                                            <SingleSelectOption value="double">Number double</SingleSelectOption>
                                                            <SingleSelectOption value="date">Date</SingleSelectOption>
                                                            <SingleSelectOption value="geo_point">Geopoint</SingleSelectOption>
                                                            <SingleSelectOption value="nested">Nested</SingleSelectOption>
                                                            <SingleSelectOption value="etc">etc</SingleSelectOption>
                                                        </SingleSelect>
                                                    </Box>

                                                    <Box style={{flex: '1'}}>
                                                        <TextInput
                                                        label="Custom field name (in ES)"
                                                        placeholder="Enter custom field name" name="Custom field name"
                                                        disabled={mapping && !mapping.mapping[key]} />
                                                        {/* onChange={e => updateMappedFieldName(e.target.value)} value={config.searchFieldName || ""} */}
                                                    </Box>


                                                </Flex>



                                        
                                

                                                {
                                                
                                                    // Object.values(value).map((value2,index) => {

                                                    //     return (
                                                    //         <>

                                                    //         {/* <div>value is: { value }</div> */}
                                                    //         <div>
                                                    //             { value2 }
                                                    //             </div>
                                                    //         </>
                                                    //     )
                                                    // })
                                                    // {Object.entries(yourProp).map(([key,val]) => (
                                                    //     <li key={key}><strong>{key}</strong>: '{val}'</li>
                                                    //   ))}



                                                    // Object.entries(fields[key]).map(([key,val]) => {

                                                    //     return (
                                                    //         <>

                                                    //         {/* <div>value is: { value }</div> */}
                                                    //         <div>
                                                    //             { key }
                                                    //             </div>
                                                    //         </>
                                                    //     )
                                                    // })
                                                
                                                }
                                                <Box paddingTop={4} paddingBottom={4}>
                                                    <hr />
                                                </Box>
                                            </Box>


                                    )

                                
                                })
                            }

                        </TabPanel>
                        <TabPanel id="raw">
                            
                            { mapping && (
                                <pre>{ JSON.stringify(mapping, null, 8) }</pre>
                            )}
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
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

// Initializer.propTypes = {
//     setPlugin: PropTypes.func.isRequired
// }

//export default Mapping
