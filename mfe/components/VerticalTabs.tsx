import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { Avatar } from "@material-ui/core";
import { MultiStepModalStep } from "./MultiStepModal/types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

interface VerticalTabsProps {
  tabs: MultiStepModalStep[];
  tabIndex: number;
  setTabIndex: (index: number) => void;
  disabled: boolean;
  image: {
    base64: string;
    timestamp: number;
  } | null;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      // style={{ width: "75%", paddingLeft: "0px" }}
    >
      {value === index && (
        <Box pb={3} pl={3} pr={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
  },
  tabsContainer: {
    position: "sticky",
    top: 0,
    left: 0,
    height: "100%",
    // backgroundColor: theme.palette.background.paper,
    overflowY: "auto",
  },
  indicator: {
    display: "none",
  },
  tabPanelContainer: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    flexGrow: 1,
    overflowY: "auto",
    // maxHeight: "calc(100vh - 64px)",
    width: "75%",
  },
  tab: {
    textTransform: "none",
    height: "100%",
    "&.Mui-selected": {
      backgroundColor: theme.palette.action.selected,
    },
    "& .MuiTab-wrapper": {
      paddingLeft: theme.spacing(2),
      alignItems: "flex-start",
    },
  },
}));

export default function VerticalTabs({
  tabs,
  tabIndex,
  setTabIndex,
  disabled,
  image,
}: VerticalTabsProps) {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <div className={classes.root}>
      <div className={classes.tabsContainer}>
        <Tabs
          orientation="vertical"
          value={tabIndex}
          onChange={handleChange}
          classes={{
            // root: classes.tabs,
            indicator: classes.indicator,
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              className={classes.tab}
              key={index}
              label={<Typography variant="body1">{tab.Title}</Typography>}
              {...a11yProps(index)}
              disabled={
                index === 0 ? false : index === 1 ? disabled : image === null
              }
            />
          ))}
        </Tabs>
      </div>
      <div className={classes.tabPanelContainer}>
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={tabIndex} index={index}>
            {tab.Content}
          </TabPanel>
        ))}
      </div>
    </div>
  );
}
