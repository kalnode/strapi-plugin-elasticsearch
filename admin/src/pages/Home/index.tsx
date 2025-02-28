/**
 *
 * PAGE: Home
 * 
 */

import { useState, useEffect } from 'react'
import { SubNavigation } from '../../components/SubNavigation'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { Refresh } from '@strapi/icons'
import { Box, Flex, Switch, ToggleInput, RadioGroup, Radio, Tab, TwoColsLayout, Button, IconButton, Table, Tr, Td, Grid, GridItem, Divider, Checkbox, ContentLayout, Container, ActionLayout, Layout, Link, Option, Select, Typography } from '@strapi/design-system';
import axiosInstance  from '../../utils/axiosInstance'
import { apiGetSystemInfo, apiForceRebuildIndex, apiTriggerIndexing, apiIndexingEnabled, apiToggleIndexingEnabled, apiToggleUseNewPluginParadigmEnabled, apiInstantIndexing, apiToggleInstantIndexing } from '../../utils/apiUrls'

const loadSystemInfo = () => {
    return axiosInstance.get(apiGetSystemInfo)
        .then((resp) => resp.data)
        .then((data) => {
            return data
        })
}

const PageHome = () => {

    // =========================
    // GENERAL
    // =========================

    const [setupInfo, setSystemInfo] = useState(null)
    const [isInProgress, setIsInProgress] = useState(false)
    const [indexingEnabled, setIndexingEnabled] = useState(false)
    const [useNewPluginParadigmEnabled, setUseNewPluginParadigmEnabled] = useState(false)
    const [IndexingMode, setIndexingMode] = useState(false)
    const showNotification = useNotification()

    const displayLabels: { [key: string]: string } = {
        'connected': 'Connected',
        'elasticCertificate': 'Certificate',
        'elasticHost': 'Elasticsearch host',
        'elasticIndexAlias': 'Elasticsearch index Alias name',
        'elasticUserName': 'Elasticsearch username',
        'indexingCronSchedule': 'Indexing cron schedule',
        'initialized': 'Elasticsearch configuration loaded'
    }

    // =========================
    // API REQUESTS
    // =========================

    const requestForceRebuildIndex = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiForceRebuildIndex)
            .then(() => {
                showNotification({
                    type: "success", message: "Rebuilding the index is triggered.", timeout: 5000
                })
            })
            .catch(() => {
                showNotification({
                    type: "warning", message: "An error has encountered.", timeout: 5000
                })
            })
            .finally(() => setIsInProgress(false))
    }

    const requestTriggerIndexing = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiTriggerIndexing)
        .then(() => {
            showNotification({
                type: "success", message: "The indexing job to process the pending tasks is started.", timeout: 5000
            })
        })
        .catch(() => {
            showNotification({
                type: "warning", message: "An error was encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }


    const getIndexingMode = async () => {
        let work = await axiosInstance.get(apiInstantIndexing)
        if (work) {
            setIndexingMode(work.data)
        }
    }

    const toggleIndexingMode = async () => {
        setIsInProgress(true)
        let work = await axiosInstance.get(apiToggleInstantIndexing)
        
        if (work) {
            setIndexingMode(work.data)
        } else {
            showNotification({
                type: "warning", message: "An error was encountered trying to set Instant Indexing.", timeout: 5000
            })
        }
        setIsInProgress(false)
    }
    
    // =========================
    // MISC
    // =========================

    const reloadSystemInfo = (showNotificationAfter?: boolean) => {
        setIsInProgress(true)
        loadSystemInfo()
        .then(setSystemInfo)
        .then(() => {
            if (showNotificationAfter)
                showNotification({
                    type: "success", message: "System information reloaded.", timeout: 5000
                })
        })
        .finally(() => setIsInProgress(false))
    }

    const getIndexingEnabled = async () => {
        let work = await axiosInstance.get(apiIndexingEnabled)
        if (work) {
            setIndexingEnabled(work.data)
        }
    }

    const toggleIndexingEnabled = async () => {
        setIsInProgress(true)
        let work = await axiosInstance.get(apiToggleIndexingEnabled)
        
        if (work) {
            setIndexingEnabled(work.data)
        } else {
            showNotification({
                type: "warning", message: "An error was encountered trying to set Instant Indexing.", timeout: 5000
            })
        }
        setIsInProgress(false)
    }

    const toggleUseNewPluginParadigmEnabled = async () => {
        setIsInProgress(true)
        let work = await axiosInstance.get(apiToggleUseNewPluginParadigmEnabled)
        
        if (work) {
            setUseNewPluginParadigmEnabled(work.data)
        } else {
            showNotification({
                type: "warning", message: "An error was encountered trying to set UseNewPluginParadigm.", timeout: 5000
            })
        }
        setIsInProgress(false)
    }


    // =========================
    // LIFECYCLE STUFF
    // =========================

    useEffect(() => {
        getIndexingEnabled()
        getIndexingMode()
        reloadSystemInfo()
    }, [])


    // =========================
    // TEMPLATE
    // =========================

    if (setupInfo === null) {
        return <LoadingIndicatorPage />
    } else {
        return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />
            <Flex direction="column" alignItems="start" gap={8} padding={8} background="neutral100" width="100%">
                <Box>
                    <Typography variant="alpha">Home</Typography>
                </Box>


                {/* ---------------------------------------------- */}
                {/* HEADER */}
                {/* ---------------------------------------------- */}
                <Flex direction="column" alignItems="start" gap={8} width="100%">
                    <Box style={{ alignSelf: 'stretch' }} background="neutral0" padding="32px" hasRadius={true}>
                        <Flex direction="column" alignItems="start" gap={8}>

                            <Typography variant="beta">Basics</Typography>

                            <Flex direction="column" alignItems="start" gap={6}>
                                <Box>
                                    <Flex gap={4}>
                                        <Typography variant="delta">Indexing</Typography>
                                        <Switch 
                                            onClick={toggleIndexingEnabled}
                                            selected={indexingEnabled}
                                            visibleLabels
                                            onLabel = 'Enabled'
                                            offLabel = 'Disabled'
                                        />
                                    </Flex>
                                </Box>

                                <Box>
                                    <Flex gap={4}>
                                        <Typography variant="delta">Use new paradigm</Typography>
                                        <Switch 
                                            onClick={toggleUseNewPluginParadigmEnabled}
                                            selected={indexingEnabled}
                                            visibleLabels
                                            onLabel = 'Enabled'
                                            offLabel = 'Disabled'
                                        />
                                    </Flex>
                                </Box>

                                <Box>
                                    <Flex gap={4}>
                                        <Typography variant="delta">Mode</Typography>
                                        {/* <ToggleInput
                                            checked={IndexingMode}
                                            onChange={toggleIndexingMode}
                                            selected={IndexingMode}
                                            onLabel = 'Scheduled Indexing'
                                            offLabel = 'Instant Indexing'
                                        /> */}
                                        <RadioGroup
                                            value={ IndexingMode ? 'instant' : 'scheduled' }
                                            onChange={ toggleIndexingMode }
                                        >
                                            <Flex gap={4}>
                                                <Radio value="instant">
                                                    Instant Indexing
                                                </Radio>
                                                <Radio value="scheduled">
                                                    Scheduled Indexing
                                                </Radio>
                                            </Flex>
                                        </RadioGroup>

                                    </Flex>
                                    {/* onCheckedChange={toggleIndexingMode()} */}
                                    {/* {IndexingMode && (<div>IndexingMode: true</div>)} */}
                                </Box>

                                <Box>
                                    <Flex gap={4}>
                                        <Typography variant="delta">Actions</Typography>
                                        <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestForceRebuildIndex}>Force Rebuild Index</Button>
                                        <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestTriggerIndexing}>Trigger Scheduled Indexing</Button>
                                    </Flex>
                                </Box>

                            </Flex>

                        </Flex>
                    </Box>
                </Flex>


                {/* ---------------------------------------------- */}
                {/* MAIN CONTENT */}
                {/* ---------------------------------------------- */}
                <Flex direction="column" alignItems="start" gap={8} width="100%">
                    <Box style={{ alignSelf: 'stretch' }} background="neutral0" padding="32px" hasRadius={true}>
                        <Flex direction="column" alignItems="start" gap={8}>

                            <Typography variant="beta">Connection</Typography>

                            <Box>
                                <Typography variant="delta">Connected</Typography>
                                <Flex>
                                    <Box padding={2}>
                                        { setupInfo['connected'] && setupInfo['connected'] === true && (
                                            <Typography fontWeight="bold" textColor="success500">Yes</Typography>
                                        )}
                                        { setupInfo['connected'] && setupInfo['connected'] === false && (
                                            <Typography fontWeight="bold" textColor="danger500">No</Typography>
                                        )}
                                    </Box>
                                    <Box padding={1}>
                                        { setupInfo['connected'] ?
                                            <IconButton disabled={isInProgress} onClick={() => reloadSystemInfo(true)} label="Refresh" icon={<Refresh />} />
                                        : null }
                                    </Box>
                                </Flex>
                            </Box>

                            <Box>
                                { setupInfo && (
                                    Object.keys(setupInfo).map((k, idx) => {
                                        if (k !== 'connected') {
                                            return (
                                                <Flex key={idx} gap={2} justifyBetween>
                                                    <Box>
                                                        <Typography textColor="neutral600">{ displayLabels[k] }:</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography textColor="neutral600">{ String(setupInfo[k]) }</Typography>
                                                    </Box>                                            
                                                </Flex>
                                            )
                                        }
                                    })                                
                                ) }
                            </Box>
      

                        </Flex>
                    </Box>
                </Flex>

                {/* <Box width="100%" paddingBottom={4}>
                    <TwoColsLayout startCol={
                        <>
                        Column 1
                    </>}

                    endCol={<>
                        Column 2
                        </>
                    } />
                </Box> */}
            </Flex>
        </Flex>
        )
    }
}


export default PageHome