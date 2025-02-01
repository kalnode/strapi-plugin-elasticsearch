import React from 'react'
import { Connector } from '@strapi/icons'
import { Box } from '@strapi/design-system'
//import { SubNav, SubNavHeader, SubNavSection, SubNavSections, SubNavLink } from '@strapi/design-system/v2'
import { SubNav, SubNavHeader, SubNavSection, SubNavSections, SubNavLink } from '@strapi/design-system'
import { NavLink } from 'react-router-dom'
import pluginId from "../../pluginId"

export const SubNavigation = ({activeUrl}) => {
    const links = [
        {
            id: 1,
            label : 'Home',
            icon : Connector,
            to : `/plugins/${pluginId}/home`
        },
        {
            id: 2,
            label : 'Indexes',
            icon : Connector,
            to : `/plugins/${pluginId}/indexes`
        },
        {
            id: 5,
            label : 'Mappings',
            icon : Connector,
            to : `/plugins/${pluginId}/mappings`
        },
        {
            id: 6,
            label : 'Tools',
            icon : Connector,
            to : `/plugins/${pluginId}/tools`
        },
    ]

    const links_old = [
        {
            id: 3,
            label : 'Configure Collections',
            icon : Connector,
            to : `/plugins/${pluginId}/configure-collections`
        },
        {
            id: 4,
            label : 'Indexing Run Logs',
            icon : Connector,
            to : `/plugins/${pluginId}/view-indexing-logs`
        },
    ]

    return (<Box style={{ height: '100vh' }} background="neutral200">
        <SubNav ariaLabel="Settings sub nav">
            <SubNavHeader label="Strapi Elasticsearch" />
            <SubNavSections>
                <SubNavSection>
                    {links.map(
                        link => link.icon &&
                        <SubNavLink as={NavLink} to={link.to} key={link.id}>
                            {link.label}
                        </SubNavLink>
                        // icon={link.icon}
                        
                        )
                    }
                </SubNavSection>

                <Box padding={4}>
                    <hr />
                    Old pages:
                </Box>

                <SubNavSection>
                    {links_old.map(
                        link => link.icon &&
                        <SubNavLink as={NavLink} to={link.to} key={link.id}>
                            {link.label}
                        </SubNavLink>
                        // icon={link.icon}
                        
                        )
                    }
                </SubNavSection>

                {/* <SubNavSection>
                    {
                    links.map( (link) => {

                        if (link.icon) {
                            return (
                                <SubNavLink as={NavLink} to={link.to} icon={link.icon} key={link.id}>
                                    {link.label}
                                </SubNavLink>
                            )
                        }
                    } )

                }
                </SubNavSection> */}
            </SubNavSections>
        </SubNav>
    </Box>)
}