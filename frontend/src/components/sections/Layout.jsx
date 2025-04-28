import React from "react";
import Head from "next/head";
import { Container, Box, Typography, AppBar, Toolbar } from "@mui/material";

const Layout = ({ children, title = "どうぶつの森 マイデザイン生成" }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="どうぶつの森のマイデザインを自動生成するWebアプリ"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
          </Toolbar>
        </AppBar>
        <Container component="main" sx={{ flex: 1, py: 4 }}>
          {children}
        </Container>
      </Box>
    </>
  );
};

export default Layout;
