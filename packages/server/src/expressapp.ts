import express from 'express';
import expressWs from "express-ws";

const { app, applyTo } = expressWs(express());

export { app, applyTo };
