import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { Box, FormLayout, TextField, Button, Layout, Page } from "@shopify/polaris";
import { useState, useCallback } from 'react';
import db from "../db.server";

export async function loader() {
  // provides data to the component

  let formData = await db.User.findFirst();

  console.log("User ...", formData);
  return json(formData);
}

export async function action({request}) {
  // updates persistent data
  let submitData = await request.formData();
  submitData = Object.fromEntries(submitData);

  await db.User.upsert({
    where: {
      id: 1
    },
    update: {
      name: submitData.name,
      email: submitData.email
    },
    create: {
      name: submitData.name,
      email: submitData.email
    }
  });
  
  return json(submitData);
}

export default function formSubmitPage() {

  const getFormData = useLoaderData();
  const [formState, setFormState] = useState(getFormData);

  const handleSubmit = useCallback(() => {
    setFormState('');
  }, []);

  return (
      <Page>
          <ui-title-bar title="Form Submit page" />
          <Layout>
              <Form method="POST">
                  <FormLayout>
                      <TextField
                      label="Name"
                      type="text"
                      name="name"
                      value={formState?.name}
                      onChange={(value) => setFormState({...formState, name: value})}
                      />

                      <TextField
                      value={formState?.email}
                      onChange={(value) => setFormState({...formState, email: value})}
                      label="Email"
                      type="email"
                      autoComplete="email"
                      name="email"
                      helpText={
                          <span>
                          Your email address please
                          </span>
                      }
                      />

                      <Button submit>Submit</Button>
                  </FormLayout>
              </Form>
          </Layout>
      </Page>
  );
}
  
  function Code({ children }) {
    return (
      <Box
        as="span"
        padding="025"
        paddingInlineStart="100"
        paddingInlineEnd="100"
        background="bg-surface-active"
        borderWidth="025"
        borderColor="border"
        borderRadius="100"
      >
        <code>{children}</code>
      </Box>
    );
  }
  