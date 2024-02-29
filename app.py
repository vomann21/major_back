#!/usr/bin/env python
# coding: utf-8



# In[1]:
from flask import Flask, request, jsonify
import re
import numpy as np
import pandas as pd


# In[2]:

app = Flask(__name__)

laptop_df = pd.read_csv('flip_laptop.csv')
phone_df = pd.read_csv('flip_phones.csv')
fridge_df = pd.read_csv('flip_fridgess.csv')
tv_df = pd.read_csv('flip_Tv.csv')
ac_df = pd.read_csv('flip_ac.csv')

combined_df = pd.concat([laptop_df,phone_df,fridge_df,tv_df,ac_df], axis=0, ignore_index=True)
combined_df.to_csv('combined_flipkart_products.csv', index=False)


# In[3]:


num_rows_unique = combined_df.shape[0]
print(num_rows_unique)


# In[4]:


combined_df


# In[5]:


combined_df.info()


# In[6]:


combined_df.isnull().sum()


# In[7]:


new_df = pd.concat([laptop_df,phone_df,fridge_df,tv_df,ac_df], axis=0, ignore_index=True)
new_df.to_csv('combined_flipkart_products.csv', index=False)


# In[8]:


def remove_special_characters(text):
    import re
    # Replace all non-alphabetic characters and spaces with an empty string
    return re.sub(r'[^a-zA-Z0-9\s]', '', text)
new_df['title'] = new_df['title'].apply(remove_special_characters)
new_df['price'] = new_df['price'].apply(remove_special_characters)
new_df['description'] = new_df['description'].apply(remove_special_characters)
new_df['brand'] = new_df['brand'].apply(remove_special_characters)
new_df['platform'] = new_df['platform'].apply(remove_special_characters)
new_df['type'] = new_df['type'].apply(remove_special_characters)


# In[9]:


new_df.head()


# In[10]:


new_df['tags'] = new_df['title']+new_df['price']+new_df['description']+new_df['brand']+new_df['platform']+new_df['type']
new_df.head()


# In[11]:


new_df = new_df[['title','description','brand','platform','type','tags']]


# In[12]:


new_df


# In[13]:


import nltk
from nltk.stem.porter import PorterStemmer
ps = PorterStemmer()


# In[14]:


def stem(text):
    y = []
    for i in text.split():
        y.append(ps.stem(i))
    return " ".join(y)


# In[15]:


new_df['tags']=new_df['tags'].apply(stem)


# In[16]:


new_df['tags']=new_df['tags'].apply(lambda x:x.lower()) 


# In[17]:


new_df['tags']


# In[18]:


from sklearn.feature_extraction.text import CountVectorizer
cv = CountVectorizer(max_features=5000,stop_words='english')


# In[19]:


subset_df = new_df.head(30000)
vectors = cv.fit_transform(subset_df['tags']).toarray()


# In[20]:


vectors


# In[21]:


cv.get_feature_names_out()


# In[22]:


from sklearn.metrics.pairwise import cosine_similarity


# In[23]:


cosine_similarity(vectors).shape


# In[24]:


similarity = cosine_similarity(vectors)


# In[25]:


# # Assuming 'similarity' is your similarity matrix
# result = sorted(enumerate(similarity[0]), reverse=True, key=lambda x: x[1])

# # Filter out tuples with similarity score 1.0
# filtered_result = [(index, score) for index, score in result if score < 1.0]

# # Take the top 100 tuples
# top_100 = filtered_result[:100]

# # Print the top 100 tuples
# print(top_100)


# In[26]:


def recommend(product):
    product_index = new_df[new_df['product_name'] == product].index[0]
    distances = similarity[product_index]
    products_list = sorted(list(enumerate(distances)),reverse=True,key=lambda x:x[1])[1:10]
    for i in products_list:
        print(new_df.iloc[i[0]].title)

# Define Flask routes
@app.route('/recommend/')
def get_recommendations():
    product_name = request.args.get('product_name')
    recommendations = recommend(product_name)
    return jsonify({'recommendations': recommendations})

if __name__ == '__main__':
    app.run(debug=True)