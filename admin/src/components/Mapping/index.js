/**
 *
 * Mapping component
 *
 */

import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { Box, Button, Typography, ToggleInput, TextInput, Flex, Textarea, Switch, SingleSelect, SingleSelectOption } from '@strapi/design-system'
import { apiGetMappings, apiCreateMapping, apiDeleteMapping, apiGetContentTypes } from '../../utils/apiUrls'
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



export const Mapping = ({ posttype }) => {

    const [isInProgress, setIsInProgress] = useState(false)
    const [mapping, setMapping] = useState(null)
    const [contentTypes, setContentTypes] = useState(null)
    const showNotification = useNotification()

    const getContentTypes = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiGetContentTypes)
            .then((response) => {
                console.log("PAGE getContentTypes response: ", response.data)
                setContentTypes(response.data)
                showNotification({
                    type: "success", message: "getContentTypes: " + response.data, timeout: 5000
                })
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
    }

    const updateFieldActive = async (key) => {

        console.log("Update active: ", key)

        let payload = {
            ...mapping,
            //[key]: { active: true }
        }

        if (payload[key]) {
            delete payload[key]
        } else {
            payload = {
                ...payload,
                [key]: { active: true }
            }
        }




        await setMapping(payload)

        console.log("Mapping is: ", mapping)
    }

    useEffect(() => {
        getContentTypes()
    }, [])

    // const ref = useRef()
    // ref.current = setPlugin

    // useEffect(() => {
    //     ref.current(pluginId)
    // }, [])

   
    // const updateIndex = (checked) => {
    //     setFieldConfig({index, config: {...config, index: checked}})
    // }

    // const updateMappedFieldName = (mappedName) => {
    //     setFieldConfig({index, config: {...config, searchFieldName: mappedName}})
    // }

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

    // const updateSubfieldConfig = (subfields) => {
    //     const subfieldsConfigValid = validateSubfieldsConfig(subfields);
    //     setFieldConfig({index, config: {...config, subfields, subfieldsConfigValid}})
    // }
 


    return  (
        <Box>

            { !contentTypes && (

                <>
                No fields!
                </>
            )}

            { contentTypes && contentTypes[posttype] && (

                <>

                {
                    
                    Object.entries(contentTypes[posttype]).map(([key,val]) => {
                    //Object.keys(fields).map((key,index) => {
                        
                        return (
                            
                            <>

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
                                                    selected is: {JSON.stringify(mapping[key])}
                                                </div>
                                                </>
                                            )} */}

                                                <Switch
                                                    selected={mapping && mapping[key] && mapping[key].active}
                                                    onChange={(e) => updateFieldActive(key)}
                                                    label = 'Active'
                                                    onLabel = 'Enabled'
                                                    offLabel = 'Disabled' />
                                                    {/* checked={config.index} onChange={(e) => updateIndex(e.target.checked)}  */}
                                            </div>
                                        </Flex>

                                        <Flex style={{flexDirection: 'column', alignSelf: 'stretch'}}>
                                            <div style={{fontSize: '0.75rem', lineHeight: '1.33'}}>
                                                <Typography variant="pi" fontWeight={'bold'}>Index</Typography>
                                            </div>
                                            <div style={{height: '100%', alignContent: 'center'}}>
                                                <Switch
                                                    label = 'Index'
                                                    onLabel = 'Enabled'
                                                    offLabel = 'Disabled' />
                                            </div>
                                        </Flex>

                                        {/* onClick={toggleIndexingEnabled}
                                        selected={indexingEnabled} */}

                                        {/* <TextInput label="Data Type" placeholder="Enter explicit data type" name="Data Type" /> */}
                                        {/* onChange={e => updateMappedFieldName(e.target.value)} value={config.searchFieldName || ""} */}

                                        <Box style={{flex: '1'}}>
                                            <SingleSelect label="Data Type">
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
                                            <TextInput label="Custom field name (in ES)" placeholder="Enter custom field name" name="Custom field name" />
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
                            </>

                        )

                    
                    })
                }


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
                    <Button onClick={() => console.log("Hello!")} variant="tertiary">
                        Create Mapping
                    </Button>
                </>
                )}


        </Box>
    )
}

// Initializer.propTypes = {
//     setPlugin: PropTypes.func.isRequired
// }

//export default Mapping
