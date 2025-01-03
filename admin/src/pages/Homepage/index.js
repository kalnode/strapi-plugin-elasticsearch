import React, { useState, useEffect } from 'react'
import { SubNavigation } from '../../components/SubNavigation'
import { Box, Flex, Tab } from '@strapi/design-system'
import { Typography } from '@strapi/design-system'
import { Switch } from '@strapi/design-system'
import { apiGetElasticsearchSetupInfo, apiRequestReIndexing, apiTriggerIndexing, apiIndexingEnabled, apiToggleIndexingEnabled, apiInstantIndexing, apiToggleInstantIndexing } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { IconButton } from '@strapi/design-system'
import { Table, Tr, Td } from '@strapi/design-system'
import { Refresh } from '@strapi/icons'
import { TwoColsLayout, Button } from '@strapi/design-system'
import { Grid, GridItem, Divider } from '@strapi/design-system'
import {LoadingIndicatorPage, useNotification} from '@strapi/helper-plugin'

const loadElasticsearchSetupInfo = () => {
    return axiosInstance.get(apiGetElasticsearchSetupInfo)
        .then((resp) => resp.data)
        .then((data) => {
            return data
        })
}

const Homepage = () => {
    const [setupInfo, setSetupInfo] = useState(null)
    const [isInProgress, setIsInProgress] = useState(false)
    const [indexingEnabled, setIndexingEnabled] = useState(false)
    const [instantIndexing, setInstantIndexing] = useState(false)
    const toggleNotification = useNotification()


    const displayLabels = {'connected' : 'Connected',
        'elasticCertificate' : 'Certificate',
        'elasticHost' : 'Elasticsearch host',
        'elasticIndexAlias' : 'Elasticsearch index Alias name',
        'elasticUserName' : 'Elasticsearch username',
        'indexingCronSchedule' : 'Indexing cron schedule',
        'initialized' : 'Elasticsearch configuration loaded'};

    const reloadElasticsearchSetupInfo = ({showNotification}) => {

        //console.log("Rload elastic 435435435")
        setIsInProgress(true)
        loadElasticsearchSetupInfo()
        .then(setSetupInfo)
        .then(() => {
            if (showNotification)
                toggleNotification({
                    type: "success", message: "Elasticsearch setup information reloaded.", timeout: 5000
                })
        })
        .finally(() => setIsInProgress(false))
    }

    const requestFullSiteReindexing = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiRequestReIndexing)
            .then(() => {
                toggleNotification({
                    type: "success", message: "Rebuilding the index is triggered.", timeout: 5000
                })
            })
            .catch(() => {
                toggleNotification({
                    type: "warning", message: "An error was encountered.", timeout: 5000
                })
            })
            .finally(() => setIsInProgress(false))
    }

    const triggerIndexingRun = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiTriggerIndexing)
        .then(() => {
            toggleNotification({
                type: "success", message: "The indexing job to process the pending tasks is started.", timeout: 5000
            })
        })
        .catch(() => {
            toggleNotification({
                type: "warning", message: "An error was encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }


    const getIndexingEnabled = async () => {
        let work = await axiosInstance.get(apiIndexingEnabled)
        if (work) {
            //console.log("getIndexingEnabled 112233") //, work.data)
            setIndexingEnabled(work.data)
        }
    }

    const toggleIndexingEnabled = async () => {
        setIsInProgress(true)
        let work = await axiosInstance.get(apiToggleIndexingEnabled)
        
        if (work) {
            //console.log("home toggleIndexingEnabled work.data is: ", work.data)
            //console.log("toggleIndexingEnabled 112233")
            setIndexingEnabled(work.data)
        } else {
            toggleNotification({
                type: "warning", message: "An error was encountered trying to set Instant Indexing.", timeout: 5000
            })
        }
        setIsInProgress(false)
    }

    const getInstantIndexing = async () => {
        let work = await axiosInstance.get(apiInstantIndexing)
        if (work) {
            //console.log("home getInstantIndexing work.data is: ", work.data)
            //console.log("getInstantIndexing 112233")
            setInstantIndexing(work.data)
        }
    }

    const toggleInstantIndexing = async () => {
        setIsInProgress(true)
        let work = await axiosInstance.get(apiToggleInstantIndexing)
        
        if (work) {
            //console.log("toggleInstantIndexing 112233")
            setInstantIndexing(work.data)
        } else {
            toggleNotification({
                type: "warning", message: "An error was encountered trying to set Instant Indexing.", timeout: 5000
            })
        }
        setIsInProgress(false)
    }

    useEffect(() => {
        getIndexingEnabled()
        getInstantIndexing()
        reloadElasticsearchSetupInfo({showNotification: false})
    }, [])

    if (setupInfo === null)
        return <LoadingIndicatorPage />
    else
        return (
        <Flex alignItems="stretch" gap={4}>
        <SubNavigation />
        <Box padding={8} background="neutral100" width="100%">
        <Box paddingBottom={4}>
            <Typography variant="alpha">Setup Information</Typography>
        </Box>

        <Box paddingBottom={4}>


            Indexing enabled: <Switch 
            onClick={toggleIndexingEnabled}
            selected={indexingEnabled}
                visibleLabels
            />

            Instant indexing: <Switch 
            onClick={toggleInstantIndexing}
            selected={instantIndexing}
                visibleLabels
            />
            {/* onCheckedChange={toggleInstantIndexing()} */}
            {/* {instantIndexing && (<div>instantIndexing: true</div>)} */}
        </Box>

        <Box width="100%" paddingBottom={4}>
            <TwoColsLayout startCol={
                <>
            <Table>
            {
                setupInfo && (
                    Object.keys(setupInfo).map((k, idx) => {
                        return (
                            <Tr key={idx}>
                                <Td><Box padding={2}>
                                    <Typography textColor="neutral600">{displayLabels[k]} :</Typography>
                                </Box></Td>
                                <Td>
                                    <Box padding={2}>
                                    <Grid>
                                        <GridItem padding={2}>
                                            { 
                                                k === 'connected' && setupInfo[k] === true && 
                                                (
                                                    <Typography fontWeight="bold" textColor="success500">Yes</Typography>
                                                )
                                            }
                                            { 
                                                k === 'connected' && setupInfo[k] === false && 
                                                (
                                                    <Typography fontWeight="bold" textColor="danger500">No</Typography>
                                                )
                                            }
                                            {
                                                k !== 'connected' && 
                                                (
                                                    <Typography textColor="neutral600">{String(setupInfo[k])}</Typography>
                                                )
                                            }
                                        </GridItem>
                                        <GridItem padding={1}>
                                            {
                                                k === 'connected' ?
                                                <IconButton disabled={isInProgress} onClick={() => reloadElasticsearchSetupInfo({showNotification: true})} label="Refresh" icon={<Refresh />} /> : null                                            
                                            }
                                        </GridItem>
                                    </Grid>
                                    </Box>
                                </Td>
                            </Tr>
                        );
                    })
                )
            }
            </Table></>}
            endCol={<>
            <Box paddingLeft={2} paddingRight={2} paddingTop={4} paddingBottom={4} >
                <Box paddingTop={4} paddingBottom={4}>
                    <Typography variant="pi" fontWeight="bold" textColor="neutral600" >ACTIONS</Typography>
                </Box>
                <Divider />
                <Box paddingTop={4} paddingBottom={4}>
                    <Box paddingTop={2} paddingBottom={2}>
                        <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestFullSiteReindexing}>Rebuild Index</Button>
                    </Box>
                    <Box paddingTop={2} paddingBottom={2}>
                        <Button loading={isInProgress} fullWidth variant="secondary" onClick={triggerIndexingRun}>Trigger Indexing</Button>
                    </Box>
                </Box>
            </Box>
            </>
            } />
        </Box>
        </Box>
        </Flex>
        );
};


export default Homepage;